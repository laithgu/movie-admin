import http from './index'

// 获取文件下载列表
export function getDownloads(params) {
  return http.get('/downloads', { params: params })
}

// 导出 Excel 并上传到 OSS，创建下载记录
export function createDownload(params) {
  return http.post('/downloads', params)
}
