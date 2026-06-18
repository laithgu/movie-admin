<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { logout } from '@/api/auth'
import { clearTokens } from '@/utils/auth'
import { ElMessage } from 'element-plus'

const route = useRoute() // 获取当前路由信息
const router = useRouter() // 控制路由跳转

const isLoginPage = computed(() => route.path === '/login')

// 根据当前路径，高亮对应的菜单
const activeMenu = computed(() => {
  if (route.path.startsWith('/movies')) {
    return '/movies'
  }
  return route.path
})

async function handleLogout() {
  try {
    await logout()
  } finally {
    // 不管接口成功失败，本地都清掉
    clearTokens()
    ElMessage.success('已退出登录')
    router.push('/login')
  }
}
</script>

<template>
  <router-view v-if="isLoginPage" />

  <el-container v-else class="app-layout">
    <el-header class="app-header">
      <div class="app-logo">电影管理后台</div>
      <el-button class="logout-btn" link @click="handleLogout">退出登录</el-button>
    </el-header>

    <el-container>
      <el-aside width="210px" class="app-aside">
        <el-menu
          :default-active="activeMenu"
          background-color="#001529"
          text-color="#ffffffa6"
          active-text-color="#ffffff"
          router
          class="app-menu"
        >
          <el-menu-item index="/movies">电影列表</el-menu-item>
          <el-menu-item index="/downloads">下载中心</el-menu-item>
          <el-menu-item index="/users">用户管理</el-menu-item>
        </el-menu>
      </el-aside>

      <el-main class="app-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style>
.app-layout {
  height: 100vh;
}

.app-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: var(--app-header-bg);
  border-bottom: 1px solid var(--app-border);
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.04);
}

.app-logo {
  font-size: 18px;
  font-weight: 700;
  color: var(--app-text);
}

.logout-btn {
  color: var(--app-text-secondary);
}

.logout-btn:hover {
  color: var(--app-primary);
}

.app-aside {
  height: calc(100vh - 60px);
  background: var(--app-sidebar-bg);
}

.app-menu {
  height: 100%;
  border-right: none;
}

.app-menu .el-menu-item {
  height: 48px;
  margin: 4px 10px;
  border-radius: 8px;
}

.app-menu .el-menu-item.is-active {
  background: rgba(255, 255, 255, 0.14);
}

.app-main {
  padding: 0;
  background: var(--app-bg);
  overflow: auto;
}
</style>
