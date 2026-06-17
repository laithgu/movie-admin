import http from './index'

// 获取用户列表
export function getUsers(params) {
    return http.get('/users', { params })
}
