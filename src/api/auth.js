import http from './index'
import { getRefreshToken } from '@/utils/auth'

export function login(data) {
    return http.post('/auth/login', data)
}

export function logout() {
    // logout 需要把 refresh_token 一起带上，服务端从白名单删除该 jti
    return http.post('/auth/logout', {
        refresh_token: getRefreshToken(),
    })
}

export function getCurrentUser() {
    return http.get('/auth/me')
}

// 用 refresh_token 换一对新的 token
// 注意：这个请求不能走默认的请求拦截器（避免带上过期的 access_token），
// 也不能走默认的响应拦截器（避免 refresh 失败时无限递归刷新）。
export function refreshToken(refreshToken) {
    // 用裸 axios，不挂任何拦截器
    return http.rawPost('/auth/refresh', { refresh_token: refreshToken })
}
