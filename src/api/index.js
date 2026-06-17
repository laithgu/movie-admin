import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

// 设置默认的请求前缀
axios.defaults.baseURL = '/api/v1'
// 设置默认超时时间
axios.defaults.timeout = 15000

// 请求拦截器：每次请求自动带token
axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')

    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
})

// 响应拦截器：token失效时跳回登录页
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            ElMessage.error('登录已失效，请重新登录')
            router.push('/login')
        }

        return Promise.reject(error)
    }
)

export default axios
