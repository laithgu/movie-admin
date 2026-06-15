<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 根据当前路径，高亮对应的菜单
const activeMenu = computed(() => {
  // 如果路径以 /movies 开头，高亮电影列表
  if (route.path.startsWith('/movies')) {
    return '/movies'
  }
  return route.path
})
</script>

<template>
  <el-container style="height: 100vh">
    <!-- 顶部导航栏 -->
    <el-header style="background: #001529; display: flex; align-items: center; padding: 0 20px">
      <div style="color: #fff; font-size: 18px; font-weight: 600; margin-right: 40px">
        电影管理后台
      </div>
      <el-menu
          mode="horizontal"
          :default-active="activeMenu"
          background-color="#001529"
          text-color="#ffffffa6"
          active-text-color="#ffffff"
          router
          style="flex: 1; border-bottom: none"
      >
        <el-menu-item index="/">电影列表</el-menu-item>
        <el-menu-item index="/downloads">下载中心</el-menu-item>
      </el-menu>
    </el-header>

    <!-- 主内容区 -->
    <el-main style="padding: 0; background: #f5f7fa">
      <router-view />
    </el-main>
  </el-container>
</template>