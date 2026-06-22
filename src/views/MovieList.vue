<template>
  <div class="page">
    <div class="page-header">
      <h2 class="page-title">电影列表</h2>
    </div>

    <!-- 筛选区，用 form 排布，自动换行 -->
    <el-card shadow="never" class="filter-card">
      <el-form :inline="true" :model="form" label-width="60px" class="filter-form" @submit.prevent="search">
        <el-form-item label="名称">
          <el-input v-model="keyword" placeholder="电影名" clearable style="width: 180px" @keyup.enter="search" />
        </el-form-item>

        <el-form-item label="分类">
          <el-select v-model="category" multiple clearable placeholder="请选择分类" style="width: 200px">
            <el-option label="动作" value="动作" />
            <el-option label="科幻" value="科幻" />
            <el-option label="喜剧" value="喜剧" />
            <el-option label="悬疑" value="悬疑" />
          </el-select>
        </el-form-item>

        <el-form-item label="地区">
          <el-select v-model="region" multiple clearable placeholder="请选择地区" style="width: 200px">
            <el-option label="中国大陆" value="中国大陆" />
            <el-option label="美国" value="美国" />
            <el-option label="英国" value="英国" />
            <el-option label="法国" value="法国" />
            <el-option label="日本" value="日本" />
            <el-option label="泰国" value="泰国" />
            <el-option label="意大利" value="意大利" />
          </el-select>
        </el-form-item>

        <el-form-item label="时长">
          <el-input v-model="duration_min" placeholder="最小" clearable style="width: 90px" />
          <span style="margin: 0 6px; color: #999">~</span>
          <el-input v-model="duration_max" placeholder="最大" clearable style="width: 90px" />
        </el-form-item>

        <el-form-item label="评分">
          <el-input v-model="score_min" placeholder="最小" clearable style="width: 90px" />
          <span style="margin: 0 6px; color: #999">~</span>
          <el-input v-model="score_max" placeholder="最大" clearable style="width: 90px" />
        </el-form-item>

        <el-form-item label="年份">
          <el-input v-model="year" placeholder="如 2020" clearable style="width: 120px" />
        </el-form-item>

        <el-form-item label="导演">
          <el-input v-model="director" placeholder="导演" clearable style="width: 150px" />
        </el-form-item>

        <el-form-item label="演员">
          <el-input v-model="actor" placeholder="演员" clearable style="width: 150px" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="search">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
          <el-button type="success" @click="handleExport">导出 Excel</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格 -->
    <el-card shadow="never" class="table-card">
      <el-table :data="movies" v-loading="loading" border stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column label="封面" width="80">
          <template #default="{ row }">
            <img
              v-if="row.cover_url"
              :src="row.cover_url"
              alt="封面"
              style="width: 50px; height: 70px; object-fit: cover; border-radius: 4px"
            />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="电影名" min-width="180" show-overflow-tooltip />
        <el-table-column prop="score" label="评分" width="70" align="center" />
        <el-table-column label="分类" width="140">
          <template #default="{ row }">{{ (row.categories || []).join(', ') || '-' }}</template>
        </el-table-column>
        <el-table-column label="地区" width="120">
          <template #default="{ row }">{{ (row.regions || []).join(', ') || '-' }}</template>
        </el-table-column>
        <el-table-column prop="director" label="导演" width="110" show-overflow-tooltip />
        <el-table-column label="时长" width="80" align="center">
          <template #default="{ row }">{{ row.duration ? row.duration + '分' : '-' }}</template>
        </el-table-column>
        <el-table-column prop="published_at" label="上映" width="110" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="$router.push('/movies/' + row.id)">详情</el-button>
            <el-popconfirm
              title="确认删除？"
              confirm-button-text="删除"
              confirm-button-type="danger"
              @confirm="handleDelete(row.id)"
            >
              <template #reference>
                <el-button link type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="perPage"
          :total="total"
          :page-sizes="[12, 24, 48]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getMovies, deleteMovie } from '@/api/movie'
import { createDownload } from '@/api/downloads'
import { ElMessage } from 'element-plus'

const movies = ref([])
const loading = ref(false)
const keyword = ref('')
const category = ref([])
const region = ref([])
const duration_min = ref('')
const duration_max = ref('')
const year = ref('')
const director = ref('')
const actor = ref('')
const score_min = ref('')
const score_max = ref('')
const page = ref(1)
const perPage = ref(12)
const total = ref(0)

// el-form 需要绑定一个 model 对象，这里给一个空对象就够了
const form = reactive({})

async function fetchData() {
  loading.value = true
  try {
    const res = await getMovies({
      keyword: keyword.value,
      category: category.value,
      region: region.value,
      duration_min: duration_min.value,
      duration_max: duration_max.value,
      year: year.value,
      director: director.value,
      actor: actor.value,
      score_min: score_min.value,
      score_max: score_max.value,
      page: page.value,
      per_page: perPage.value,
    })
    movies.value = res.data.data
    total.value = res.data.meta.total
  } catch (err) {
    if (err.handled) return
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
  category.value = []
  region.value = []
  duration_min.value = ''
  duration_max.value = ''
  year.value = ''
  director.value = ''
  actor.value = ''
  score_min.value = ''
  score_max.value = ''
  page.value = 1
  fetchData()
}

async function handleExport() {
  try {
    await createDownload({
      keyword: keyword.value,
      category: category.value,
      region: region.value,
      duration_min: duration_min.value,
      duration_max: duration_max.value,
      year: year.value,
      director: director.value,
      actor: actor.value,
    })
    ElMessage.success('导出任务已创建，请稍后到下载中心查看')
  } catch (err) {
    if (err.handled) return
    ElMessage.error('导出失败')
  }
}

async function handleDelete(id) {
  try {
    await deleteMovie(id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (err) {
    if (err.handled) return        // 403 等已被拦截器统一处理
    ElMessage.error('删除失败')
  }
}

onMounted(fetchData)
</script>

<style scoped>
/* 让 form-item 之间的间距更紧凑，去掉底部多余空间 */
.filter-card :deep(.el-form-item) {
  margin-bottom: 12px;
  margin-right: 12px;
}
</style>
