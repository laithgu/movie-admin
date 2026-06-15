<template>
  <div style="padding: 20px" v-loading="loading">
    <el-button @click="$router.push('/')" style="margin-bottom: 16px">← 返回列表</el-button>

    <template v-if="movie">
      <h2>{{ movie.name }}</h2>
      <el-descriptions :column="2" border style="margin-top: 16px">
        <el-descriptions-item label="ID">{{ movie.id }}</el-descriptions-item>
        <el-descriptions-item label="评分">{{ movie.score || '-' }}</el-descriptions-item>
        <el-descriptions-item label="导演">{{ movie.director || '-' }}</el-descriptions-item>
        <el-descriptions-item label="时长">{{ movie.duration ? movie.duration + '分钟' : '-' }}</el-descriptions-item>
        <el-descriptions-item label="分类">{{ (movie.categories || []).join(', ') || '-' }}</el-descriptions-item>
        <el-descriptions-item label="地区">{{ (movie.regions || []).join(', ') || '-' }}</el-descriptions-item>
        <el-descriptions-item label="上映日期">{{ movie.published_at || '-' }}</el-descriptions-item>
        <el-descriptions-item label="来源">{{ movie.source || '-' }}</el-descriptions-item>
        <el-descriptions-item label="演员" :span="2">{{ (movie.actors || []).join('、') || '-' }}</el-descriptions-item>
        <el-descriptions-item label="剧情" :span="2">{{ movie.drama || '暂无' }}</el-descriptions-item>
      </el-descriptions>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getMovie } from '@/api/movie'

const route = useRoute()
const movie = ref(null)
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    const res = await getMovie(route.params.id)
    movie.value = res.data.data
  } catch (err) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
})
</script>
