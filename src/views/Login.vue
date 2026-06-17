<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login } from '@/api/auth'

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

    localStorage.setItem('token', res.data.data.token)
    ElMessage.success('登录成功')
    router.push('/movies')
  } catch (err) {
    ElMessage.error('邮箱或密码错误')
  }
}
</script>


<template>
  <div class="login-page">
    <el-card class="login-card">
      <h2 class="login-title">电影管理后台</h2>

      <el-form>
        <el-form-item>
          <el-input v-model="email" placeholder="邮箱" />
        </el-form-item>

        <el-form-item>
          <el-input v-model="password" type="password" placeholder="密码" show-password @keyup.enter="handleLogin" />
        </el-form-item>

        <el-button type="primary" style="width: 100%" @click="handleLogin">登录</el-button>
      </el-form>
    </el-card>
  </div>
</template>


<style scoped>
.login-page {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f7fa;
}

.login-card {
  width: 360px;
}

.login-title {
  text-align: center;
  margin-bottom: 24px;
}
</style>
