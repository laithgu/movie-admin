<template>
  <div style="padding: 20px" v-loading="loading">
    <el-button @click="$router.push('/movies')" style="margin-bottom: 16px">← 返回列表</el-button>

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
      <!-- 评论区 -->
      <el-card style="margin-top: 16px">
        <template #header>评论 ({{ commentTotal }})</template>

        <!-- 发布评论 -->
        <div style="display: flex; gap: 12px; margin-bottom: 16px">
          <el-input v-model="newAuthor" placeholder="昵称" style="width: 150px" />
          <el-input v-model="newContent" placeholder="说点什么..." />
          <el-button type="primary" @click="submitComment">发布</el-button>
        </div>

        <!-- 评论列表 -->
        <div v-for="c in comments" :key="c.id" style="border-bottom: 1px solid #eee; padding: 12px 0">
          <div style="display: flex; justify-content: space-between">
            <strong>{{ c.author }}</strong>
            <el-button link type="danger" size="small" @click="removeComment(c.id)">删除</el-button>
          </div>
          <div style="margin-top: 8px">{{ c.content }}</div>
          <div style="color: #999; font-size: 12px; margin-top: 4px">{{ dayjs(c.created_at).format('YYYY-MM-DD HH:mm:ss') }}</div>
        </div>

        <el-empty v-if="comments.length === 0" description="暂无评论" />

        <!-- 分页 -->
        <div style="display: flex; justify-content: flex-end; margin-top: 16px">
          <el-pagination
            v-model:current-page="commentPage"
            v-model:page-size="commentPerPage"
            :total="commentTotal"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next"
            background
            @size-change="fetchComments"
            @current-change="fetchComments"
          />
        </div>
      </el-card>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import dayjs from 'dayjs'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getMovie } from '@/api/movie'
import { getComments, createComment, deleteComment } from '@/api/comment'

const route = useRoute()
const movie = ref(null)
const loading = ref(false)
const comments = ref([])
const commentPage = ref(1)
const commentPerPage = ref(10)
const commentTotal = ref(0)
const newContent = ref('')
const newAuthor = ref('')


async function fetchComments() {
  const res = await getComments(route.params.id, {
    page: commentPage.value,
    per_page: commentPerPage.value,
  })
  comments.value = res.data.data
  commentTotal.value = res.data.meta.total
}

async function submitComment() {
  if (!newAuthor.value || !newContent.value) {
    ElMessage.warning('昵称和内容都要填')
    return
  }
  try {
    await createComment(route.params.id, {
      author: newAuthor.value,
      content: newContent.value,
    })
    ElMessage.success('发布成功')
    newContent.value = ''
    fetchComments()    // 重新拉评论列表
  } catch (err) {
    if (err.handled) return
    ElMessage.error('发布失败')
  }
}

async function removeComment(id) {
  try {
    await deleteComment(id)
    ElMessage.success('删除成功')
    fetchComments()
  } catch (err) {
    if (err.handled) return        // 403 等已被拦截器统一处理
    ElMessage.error('删除失败')
  }
}


onMounted(async () => {
  loading.value = true
  try {
    const res = await getMovie(route.params.id)
    movie.value = res.data.data
    fetchComments()
  } catch (err) {
    if (err.handled) return
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
})
</script>
