<template>
  <div class="login-page">
    <div class="login-card">
      <h1>管理后台登录</h1>
      <div class="form">
        <input
          v-model="password"
          type="password"
          placeholder="请输入管理员密码"
          @keyup.enter="login"
          class="input"
        />
        <p v-if="error" class="error">{{ error }}</p>
        <button @click="login" :disabled="loading" class="btn">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { adminLogin } from '../../api/index.js'

export default {
  name: 'AdminLogin',
  setup() {
    const router = useRouter()
    const password = ref('')
    const error = ref('')
    const loading = ref(false)

    async function login() {
      if (!password.value) {
        error.value = '请输入密码'
        return
      }
      loading.value = true
      error.value = ''

      try {
        const res = await adminLogin(password.value)
        if (res.success) {
          localStorage.setItem('admin_token', res.token)
          router.push('/admin')
        } else {
          error.value = res.message || '登录失败'
        }
      } catch (e) {
        error.value = '密码错误'
      } finally {
        loading.value = false
      }
    }

    return { password, error, loading, login }
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  padding-top: 80px;
}

.login-card {
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}

.login-card h1 {
  font-size: 22px;
  margin-bottom: 24px;
  text-align: center;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input {
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s;
}

.input:focus {
  border-color: #1a1a2e;
}

.error {
  color: #e74c3c;
  font-size: 14px;
}

.btn {
  padding: 12px;
  background: #1a1a2e;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn:hover {
  background: #2d2d4e;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
