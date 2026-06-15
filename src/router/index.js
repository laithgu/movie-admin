import { createRouter, createWebHistory } from 'vue-router'
import MovieList from '@/views/MovieList.vue'
import MovieDetail from '@/views/MovieDetail.vue'

const routes = [
  { path: '/', component: MovieList },
  { path: '/movies/:id', component: MovieDetail },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
