<template>
  <div class="page">
    <div class="page-header">
      <h2 class="page-title">文件下载列表</h2>
    </div>

    <el-card shadow="never" class="filter-card">
      <div class="filter-row">
        <el-input v-model="name" placeholder="文件名" clearable style="width: 200px" @keyup.enter="search" />
        <el-date-picker v-model="start_date" type="date" value-format="YYYY-MM-DD" placeholder="开始时间" style="width: 200px" />
        <el-date-picker v-model="end_date" type="date" value-format="YYYY-MM-DD" placeholder="结束时间" style="width: 200px" />
        <el-button type="primary" @click="search">搜索</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </div>
    </el-card>

    <el-card shadow="never" class="table-card">
      <el-table :data="downloads" v-loading="loading" border stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="文件名" min-width="200" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'pending'" type="warning">处理中</el-tag>
            <el-tag v-else-if="row.status === 'completed'" type="success">已完成</el-tag>
            <el-tag v-else-if="row.status === 'failed'" type="danger">失败</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="url" label="下载链接" min-width="300" show-overflow-tooltip />
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">{{ dayjs(row.created_at).format('YYYY-MM-DD HH:mm:ss') }}</template>
        </el-table-column>
        <el-table-column label="操作" width="80">
          <template #default="{ row }">
            <el-button v-if="row.status === 'completed'" link type="primary" @click="handleDownload(row.url)">下载</el-button>
            <span v-else style="color: #999; font-size: 12px">-</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
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
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import { getDownloads } from '@/api/downloads'

const downloads = ref([])
const loading = ref(false)
const name = ref('')
const start_date = ref('')
const end_date = ref('')
const page = ref(1)
const perPage = ref(10)
const total = ref(0)

async function fetchData() {
  loading.value = true
  try {
    const res = await getDownloads({
      name: name.value,
      start_date: start_date.value,
      end_date: end_date.value,
      page: page.value,
      per_page: perPage.value,
    })
    downloads.value = res.data.data
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
  start_date.value = ''
  end_date.value = ''
  page.value = 1
  fetchData()
}

// 点击下载，新窗口打开链接
function handleDownload(url) {
  window.open(url, '_blank')
}

onMounted(fetchData)
</script>
