import http from './index'

// 获取评论列表
export function getComments(movieId) {
    return http.get('/movies/' + movieId + '/comments')}

// 创建评论
export function createComment(movieId, data) {
    return http.post('/movies/' + movieId + '/comments', { comment: data })
}

// 删除评论
export function deleteComment(id) {
    return http.delete('/comments/' + id)
}