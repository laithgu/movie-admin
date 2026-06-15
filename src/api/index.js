import axios from 'axios'

// 设置默认的请求前缀
axios.defaults.baseURL = '/api/v1'
// 设置默认超时时间
axios.defaults.timeout = 15000

export default axios
