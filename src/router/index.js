import { createRouter, createWebHistory } from 'vue-router'
import MovieList from '@/views/MovieList.vue'
import MovieDetail from '@/views/MovieDetail.vue'
import DownloadList from '@/views/DownloadList.vue'

const routes = [
  { path: '/', component: MovieList },
  { path: '/movies/:id', component: MovieDetail },
  { path: '/downloads', component: DownloadList },   // 下载中心
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
