import { createRouter, createWebHistory } from 'vue-router'
import MovieList from '@/views/MovieList.vue'
import MovieDetail from '@/views/MovieDetail.vue'
import DownloadList from '@/views/DownloadList.vue'
import UserList from '@/views/UserList.vue'
import Login from '@/views/Login.vue'
import { getAccessToken } from '@/utils/auth'

const routes = [
  { path: '/', redirect: '/movies' },
  { path: '/movies', component: MovieList },
  { path: '/movies/:id', component: MovieDetail },
  { path: '/downloads', component: DownloadList },
  { path: '/users', component: UserList },
  { path: '/login', component: Login },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 没有 access_token 不能进入后台页面
router.beforeEach((to) => {
  const token = getAccessToken()

  if (to.path !== '/login' && !token) {
    return '/login'
  }

  if (to.path === '/login' && token) {
    return '/movies'
  }
})

export default router
