import http from './index'

// 获取电影列表
export function getMovies(params) {
  return http.get('/movies', { params: params })
}

// 获取电影详情
export function getMovie(id) {
  return http.get('/movies/' + id)
}

// 删除电影
export function deleteMovie(id) {
  return http.delete('/movies/' + id)
}