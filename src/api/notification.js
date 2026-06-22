import http from './index'

export function getNotifications(params) {
  return http.get('/notifications', { params })
}

export function getUnreadCount() {
  return http.get('/notifications/unread_count')
}

export function markRead(id) {
  return http.post(`/notifications/${id}/read`)
}

export function markAllRead() {
  return http.post('/notifications/read_all')
}
