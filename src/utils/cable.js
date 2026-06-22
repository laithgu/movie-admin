import { createConsumer } from '@rails/actioncable'

let cable = null

// 用 access_token 创建 / 重建 WS 连接
// token 通过 URL query 传给后端 Connection#find_verified_user
export function createCable(token) {
    disconnectCable()
    cable = createConsumer(`/cable?token=${token}`)
    return cable
}

export function disconnectCable() {
    if (cable) {
        cable.disconnect()
        cable = null
    }
}

export function getCable() {
    return cable
}
