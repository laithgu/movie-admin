<template>
  <div style="padding: 20px">
    <h2 style="margin-bottom: 16px">电影列表</h2>

    <div style="margin-bottom: 16px; display: flex; gap: 12px; align-items: center">
      <el-input v-model="keyword" placeholder="电影名" clearable style="width: 200px" @keyup.enter="search" />
<!--      <el-input v-model="category" placeholder="分类" clearable style="width: 200px" @keyup.enter="search" />-->
      <el-select
          v-model="category"
          multiple
          clearable
          placeholder="请选择分类"
          style="width: 240px"
      >
        <el-option label="动作" value="动作" />
        <el-option label="科幻" value="科幻" />
        <el-option label="喜剧" value="喜剧" />
        <el-option label="悬疑" value="悬疑" />
      </el-select>
<!--      <el-input v-model="region" placeholder="地区" clearable style="width: 200px" @keyup.enter="search" />-->
      <el-select
          v-model="region"
          multiple
          clearable
          placeholder="请选择地区"
          style="width: 240px"
      >
        <el-option label="中国" value="中国" />
        <el-option label="中国大陆" value="中国大陆" />
        <el-option label="美国" value="美国" />
        <el-option label="英国" value="英国" />
        <el-option label="法国" value="法国" />
        <el-option label="日本" value="日本" />
        <el-option label="泰国" value="泰国" />
        <el-option label="意大利" value="意大利" />
      </el-select>
      <el-input v-model="duration_min" placeholder="时长最小值" clearable style="width: 230px" @keyup.enter="search" />
      <el-input v-model="duration_max" placeholder="时长最大值" clearable style="width: 230px" @keyup.enter="search" />
      <el-input v-model="year" placeholder="上映时间" clearable style="width: 200px" @keyup.enter="search" />
      <el-input v-model="director" placeholder="导演" clearable style="width: 200px" @keyup.enter="search" />
      <el-input v-model="actor" placeholder="演员" clearable style="width: 200px" @keyup.enter="search" />
      <el-input v-model="score_min" placeholder="最低评分" clearable style="width: 200px" @keyup.enter="search" />
      <el-input v-model="score_max" placeholder="最高评分" clearable style="width: 200px" @keyup.enter="search" />
      <el-button type="primary" @click="search">搜索</el-button>
      <el-button @click="resetSearch">重置</el-button>
      <el-button type="success" @click="handleExport">导出 Excel</el-button>
    </div>

    <el-table :data="movies" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column label="封面" width="120">
        <template #default="{ row }">
          <img
              :src="row.cover_url"
              alt="封面"
              style="width: 80px; height: 120px; object-fit: cover;"
          />
        </template>
      </el-table-column>
      <el-table-column prop="name" label="电影名" min-width="200" />
      <el-table-column prop="score" label="评分" width="70" />
      <el-table-column label="分类" width="150">
        <template #default="{ row }">{{ (row.categories || []).join(', ') }}</template>
      </el-table-column>
      <el-table-column label="地区" width="120">
        <template #default="{ row }">{{ (row.regions || []).join(', ') }}</template>
      </el-table-column>
      <el-table-column prop="director" label="导演" width="120" />
      <el-table-column prop="duration" label="时长" width="80">
        <template #default="{ row }">{{ row.duration ? row.duration + '分' : '-' }}</template>
      </el-table-column>
      <el-table-column prop="published_at" label="上映" width="110" />
      <el-table-column label="操作" width="60">
        <template #default="{ row }">
          <el-button link type="primary" @click="$router.push('/movies/' + row.id)">详情</el-button>
        </template>
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
import { getMovies, exportMovies } from '@/api/movie'
import { ElMessage } from 'element-plus'

const movies = ref([])
const loading = ref(false)
const keyword = ref('')
const category = ref('')
const region = ref([])
const duration_min = ref('')
const duration_max = ref('')
const year = ref('')
const director = ref('')
const actor = ref([])
const score_min = ref('')
const score_max = ref('')
const page = ref(1)
const perPage = ref(10)
const total = ref(0)

async function fetchData() {
  loading.value = true
  try {
    const res = await getMovies({
      keyword: keyword.value,
      category: category.value,
      region:region.value,
      duration_min:duration_min.value,
      duration_max:duration_max.value,
      year:year.value,
      director:director.value,
      actor:actor.value,
      score_min:score_min.value,
      score_max:score_max.value,
      page: page.value, per_page: perPage.value })
    movies.value = res.data.data
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
  keyword.value = ''
  category.value = ''
  region.value = []
  duration_min.value = ''
  duration_max.value = ''
  year.value = ''
  director.value = ''
  actor.value = []
  score_min.value = ''
  score_max.value = ''
  page.value = 1
  fetchData()
}

async function handleExport() {
  try {
    const res = await exportMovies({
      keyword: keyword.value,
      category: category.value,
      region:region.value,
      duration_min:duration_min.value,
      duration_max:duration_max.value,
      year:year.value,
      director:director.value,
      actor:actor.value})
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href = url
    link.download = 'movies_export.xlsx'
    link.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (err) {
    ElMessage.error('导出失败')
  }
}

onMounted(fetchData)
</script>
