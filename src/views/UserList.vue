<template>
  <div style="padding: 20px">
    <h2 style="margin-bottom: 16px">用户管理</h2>

    <div style="margin-bottom: 16px; display: flex; gap: 12px; align-items: center; flex-wrap: wrap">
      <el-input v-model="name" placeholder="用户名" clearable style="width: 160px" @keyup.enter="search" />
      <el-input v-model="nickname" placeholder="昵称" clearable style="width: 160px" @keyup.enter="search" />
      <el-input v-model="email" placeholder="邮箱" clearable style="width: 200px" @keyup.enter="search" />
      <el-date-picker v-model="start_date" type="date" value-format="YYYY-MM-DD" placeholder="开始时间" style="width: 180px" />
      <el-date-picker v-model="end_date" type="date" value-format="YYYY-MM-DD" placeholder="结束时间" style="width: 180px" />
      <el-button type="primary" @click="search">搜索</el-button>
      <el-button @click="resetSearch">重置</el-button>
    </div>

    <el-table :data="users" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column label="头像" width="80" align="center">
        <template #default="{ row }">
          <el-avatar v-if="row.avatar" :src="row.avatar" :size="40" />
          <el-avatar v-else :size="40">{{ row.nickname?.[0] || row.name?.[0] || '用' }}</el-avatar>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="用户名" min-width="140" show-overflow-tooltip />
      <el-table-column prop="nickname" label="昵称" min-width="140" show-overflow-tooltip />
      <el-table-column prop="email" label="邮箱" min-width="200" show-overflow-tooltip />
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.status === 'active'" type="success">正常</el-tag>
          <el-tag v-else-if="row.status === 'disabled'" type="danger">禁用</el-tag>
          <el-tag v-else type="info">未知</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="180">
        <template #default="{ row }">{{ formatTime(row.created_at) }}</template>
      </el-table-column>
      <el-table-column label="更新时间" width="180">
        <template #default="{ row }">{{ formatTime(row.updated_at) }}</template>
      </el-table-column>
    </el-table>

    <div style="margin-top: 16px; display: flex; justify-content: flex-end">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="perPage"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        background
        @size-change="fetchData"
        @current-change="fetchData"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import { getUsers } from '@/api/users'

const users = ref([])
const loading = ref(false)
const name = ref('')
const nickname = ref('')
const email = ref('')
const start_date = ref('')
const end_date = ref('')
const page = ref(1)
const perPage = ref(10)
const total = ref(0)

async function fetchData() {
  loading.value = true
  try {
    const res = await getUsers({
      name: name.value,
      nickname: nickname.value,
      email: email.value,
      start_date: start_date.value,
      end_date: end_date.value,
      page: page.value,
      per_page: perPage.value,
    })
    users.value = res.data.data
    total.value = res.data.meta.total
  } catch (err) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

function search() {
  page.value = 1
  fetchData()
}

function resetSearch() {
  name.value = ''
  nickname.value = ''
  email.value = ''
  start_date.value = ''
  end_date.value = ''
  page.value = 1
  fetchData()
}

function formatTime(value) {
  return value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-'
}

onMounted(fetchData)
</script>
