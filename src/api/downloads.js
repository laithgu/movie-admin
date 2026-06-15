import http from './index'

// 获取文件下载列表
export function getDownloads(params) {
    return http.get('/downloads', { params: params })
}