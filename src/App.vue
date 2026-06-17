<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { logout } from '@/api/auth'
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
    localStorage.removeItem('token')
    ElMessage.success('已退出登录')
    router.push('/login')
  }
}
</script>

<template>
  <router-view v-if="isLoginPage" />

  <el-container v-else style="height: 100vh">
    <!-- 顶部 -->
    <el-header style="background: #001529; color: #fff; font-size: 18px; font-weight: 600; line-height: 60px; padding: 0 20px; display: flex; justify-content: space-between;
  align-items: center">
      <span>电影管理后台</span>
      <el-button link type="primary" style="color: #fff" @click="handleLogout">退出登录</el-button>
    </el-header>

    <el-container>
      <!-- 左侧菜单 -->
      <el-aside width="200px" style="background: #001529; height: calc(100vh - 60px)">
        <el-menu
            :default-active="activeMenu"
            background-color="#001529"
            text-color="#ffffffa6"
            active-text-color="#ffffff"
            router
            style="height: 100%; border-right: none"
        >
          <el-menu-item index="/movies">电影列表</el-menu-item>
          <el-menu-item index="/downloads">下载中心</el-menu-item>
          <el-menu-item index="/users">用户管理</el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 右侧内容区 -->
      <el-main style="padding: 20px; background: #f5f7fa; overflow: auto">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>
