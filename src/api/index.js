import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import {
    getAccessToken,
    getRefreshToken,
    setTokens,
    clearTokens,
} from '@/utils/auth'

// ──────────── 基础实例 ────────────

const http = axios.create({
    baseURL: '/api/v1',
    timeout: 15000,
})

// 一个不挂拦截器的"裸"实例，专给 refresh 用，避免循环
const rawHttp = axios.create({
    baseURL: '/api/v1',
    timeout: 15000,
})

// 暴露给 api/auth.js 调 refresh 用
http.rawPost = (url, data) => rawHttp.post(url, data)

// ──────────── 请求拦截器：自动带 access_token ────────────

http.interceptors.request.use((config) => {
    const token = getAccessToken()
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// ──────────── 响应拦截器：401 自动 refresh + 并发合并 ────────────

// 同时只允许一次 refresh —— 多个并发 401 共享同一个 promise
let refreshPromise = null

function tryRefresh() {
    if (refreshPromise) return refreshPromise

    const refreshToken = getRefreshToken()
    if (!refreshToken) {
        return Promise.reject(new Error('no refresh token'))
    }

    refreshPromise = rawHttp
        .post('/auth/refresh', { refresh_token: refreshToken })
        .then((res) => {
            const tokens = res.data.data
            setTokens(tokens)
            // 通知 WebSocket 用新 token 重连（旧 WS 还在用过期 token，重连断线时会被 reject）
            window.dispatchEvent(new CustomEvent('auth:token-refreshed'))
            return tokens.access_token
        })
        .finally(() => {
            // 不管成功失败，都释放，让下一轮 401 可以再试
            refreshPromise = null
        })

    return refreshPromise
}

http.interceptors.response.use(
    (response) => response,
    async (error) => {
        const { response, config } = error

        // 没有 response（网络错误等）直接抛
        if (!response) return Promise.reject(error)

        // 403：Pundit 鉴权失败 —— 不是登录态问题，是没权限
        if (response.status === 403) {
            ElMessage.error(response.data?.error || '无权限执行此操作')
            error.handled = true
            return Promise.reject(error)
        }

        // 不是 401，或者这条请求已经重试过了，直接放过
        if (response.status !== 401 || config._retried) {
            return Promise.reject(error)
        }

        // refresh 接口本身 401，说明 refresh_token 也失效了 —— 直接踢回登录
        if (config.url?.includes('/auth/refresh')) {
            clearTokens()
            ElMessage.error('登录已失效，请重新登录')
            router.push('/login')
            return Promise.reject(error)
        }

        // 标记本条请求已重试过，避免循环
        config._retried = true

        try {
            const newAccessToken = await tryRefresh()
            // 用新 token 重发当前请求
            config.headers.Authorization = `Bearer ${newAccessToken}`
            return http(config)
        } catch (refreshErr) {
            // refresh 失败 → 清掉 token 跳登录
            clearTokens()
            ElMessage.error('登录已失效，请重新登录')
            router.push('/login')
            return Promise.reject(refreshErr)
        }
    },
)

export default http