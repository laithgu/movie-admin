<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login } from '@/api/auth'
import { setTokens } from '@/utils/auth'

const router = useRouter()
const email = ref('')
const password = ref('')

async function handleLogin() {
  if (!email.value || !password.value) {
    ElMessage.warning('请输入邮箱和密码')
    return
  }

  try {
    const res = await login({
      email: email.value,
      password: password.value,
    })

    // 后端返回 { data: { access_token, refresh_token, user } }
    setTokens(res.data.data)
    ElMessage.success('登录成功')
    router.push('/movies')
  } catch (err) {
    ElMessage.error('邮箱或密码错误')
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-panel">
      <div class="login-brand">
        <div class="brand-icon">映</div>
        <h1>电影管理后台</h1>
        <p>登录后管理电影、下载任务和用户信息</p>
      </div>

      <el-card class="login-card">
        <h2 class="login-title">欢迎回来</h2>
        <p class="login-subtitle">请输入邮箱和密码登录</p>

        <el-form>
          <el-form-item>
            <el-input v-model="email" size="large" placeholder="邮箱" />
          </el-form-item>

          <el-form-item>
            <el-input v-model="password" size="large" type="password" placeholder="密码" show-password @keyup.enter="handleLogin" />
          </el-form-item>

          <el-button type="primary" size="large" class="login-button" @click="handleLogin">登录</el-button>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(135deg, #0f172a 0%, #1d4ed8 48%, #60a5fa 100%);
}

.login-panel {
  width: min(920px, 100%);
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 32px;
  align-items: center;
}

.login-brand {
  color: #fff;
}

.brand-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.18);
  font-size: 28px;
  font-weight: 700;
}

.login-brand h1 {
  margin-bottom: 12px;
  font-size: 36px;
}

.login-brand p {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.78);
}

.login-card {
  border-radius: 18px;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.25);
}

.login-title {
  margin-bottom: 8px;
  font-size: 24px;
  color: var(--app-text);
}

.login-subtitle {
  margin-bottom: 24px;
  color: var(--app-text-secondary);
}

.login-button {
  width: 100%;
}

@media (max-width: 760px) {
  .login-panel {
    grid-template-columns: 1fr;
  }

  .login-brand {
    text-align: center;
  }

  .brand-icon {
    margin: 0 auto 16px;
  }
}
</style>
