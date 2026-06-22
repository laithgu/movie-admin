<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElNotification, ElBadge, ElPopover,
  ElButton, ElIcon, ElDivider } from 'element-plus'
import { Bell } from '@element-plus/icons-vue'
import { getAccessToken } from '@/utils/auth'
import { createCable, getCable, disconnectCable } from '@/utils/cable'
import { getNotifications, getUnreadCount, markRead as apiMarkRead, markAllRead } from '@/api/notification'

const router = useRouter()
const route = useRoute()
const unreadCount = ref(0)
const notifications = ref([])
const popoverVisible = ref(false)

let subscription = null
let pollingTimer = null

// ──────────── WS 连接 ────────────

function connect() {
  const token = getAccessToken()
  if (!token) return

  createCable(token)
  const cable = getCable()
  if (!cable) return

  subscription = cable.subscriptions.create(
    { channel: 'NotificationChannel' },
    {
      received(data) {
        unreadCount.value++
        ElNotification({
          title: data.title,
          message: data.body || data.title,
          type: data.kind === 'download_completed' ? 'success' : 'error',
          duration: 5000,
          onClick: () => router.push('/downloads'),
        })
      },
    }
  )

  fetchUnread()
  startPolling()
}

function disconnect() {
  stopPolling()
  subscription?.unsubscribe()
  subscription = null
  disconnectCable()
}

function reconnect() {
  disconnect()
  connect()
}

// ──────────── 未读数 ────────────

async function fetchUnread() {
  try {
    const res = await getUnreadCount()
    unreadCount.value = res.data.data.count
  } catch {}
}

function startPolling() {
  stopPolling()
  pollingTimer = setInterval(fetchUnread, 30000)
}

function stopPolling() {
  if (pollingTimer) {
    clearInterval(pollingTimer)
    pollingTimer = null
  }
}

// ──────────── 生命周期 ────────────

onMounted(() => {
  if (getAccessToken()) connect()
  window.addEventListener('auth:token-refreshed', reconnect)
})

onUnmounted(() => {
  window.removeEventListener('auth:token-refreshed', reconnect)
  disconnect()
})

// 路由切到登录页时主动断开（App.vue 不会卸载这个组件，只有 isLoginPage 时整个 layout 才不渲染）
// 从登录页切回时（用户登录成功）重连
watch(
  () => route.path,
  (path, oldPath) => {
    if (path === '/login') {
      disconnect()
    } else if (oldPath === '/login' && getAccessToken()) {
      connect()
    }
  }
)

// ──────────── 交互 ────────────

async function openPopover() {
  try {
    const res = await getNotifications({ page: 1, per_page: 10 })
    notifications.value = res.data.data
  } catch (err) {
    if (err.handled) return
    ElMessage.error('加载通知失败')
  }
}

async function handleClick(n) {
  popoverVisible.value = false
  if (!n.read_at) {
    await apiMarkRead(n.id)
    unreadCount.value = Math.max(0, unreadCount.value - 1)
    n.read_at = new Date().toISOString()
  }
  if (n.target_type === 'Download') router.push('/downloads')
}

async function handleMarkAllRead() {
  try {
    await markAllRead()
    notifications.value.forEach(n => n.read_at ||= new Date().toISOString())
    unreadCount.value = 0
    ElMessage.success('已全部标记为已读')
  } catch (err) {
    if (err.handled) return
    ElMessage.error('操作失败')
  }
}
</script>

<template>
  <el-popover
    v-model:visible="popoverVisible"
    placement="bottom-end"
    :width="360"
    trigger="click"
    @before-enter="openPopover"
  >
    <template #reference>
      <el-badge :value="unreadCount" :hidden="unreadCount === 0" :max="99" class="bell-badge">
        <el-button link class="bell-btn">
          <el-icon :size="20"><Bell /></el-icon>
        </el-button>
      </el-badge>
    </template>

    <div class="notif-header">
      <span>通知中心</span>
      <el-button v-if="unreadCount > 0" link size="small" @click="handleMarkAllRead">全部已读</el-button>
    </div>

    <el-divider style="margin: 8px 0" />

    <div v-if="notifications.length === 0" class="notif-empty">暂无通知</div>

    <ul v-else class="notif-list">
      <li
        v-for="n in notifications"
        :key="n.id"
        class="notif-item"
        :class="{ unread: !n.read_at }"
        @click="handleClick(n)"
      >
        <div class="notif-title">{{ n.title }}</div>
        <div class="notif-body">{{ n.body }}</div>
        <div class="notif-time">{{ new Date(n.created_at).toLocaleString() }}</div>
      </li>
    </ul>
  </el-popover>
</template>

<style scoped>
.bell-badge :deep(.el-badge__content) {
  font-size: 11px;
}

.bell-btn {
  color: var(--app-text-secondary);
  padding: 4px;
}

.bell-btn:hover {
  color: var(--app-primary);
}

.notif-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  padding: 0 4px;
}

.notif-empty {
  text-align: center;
  color: var(--app-text-secondary);
  padding: 24px 0;
}

.notif-list {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 400px;
  overflow-y: auto;
}

.notif-item {
  padding: 12px 8px;
  border-bottom: 1px solid var(--app-border);
  cursor: pointer;
}

.notif-item:hover {
  background: rgba(0, 0, 0, 0.04);
}

.notif-item:last-child {
  border-bottom: none;
}

.notif-item.unread {
  background: rgba(64, 158, 255, 0.06);
}

.notif-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.notif-body {
  font-size: 13px;
  color: var(--app-text-secondary);
  margin-bottom: 4px;
}

.notif-time {
  font-size: 12px;
  color: #999;
}
</style>