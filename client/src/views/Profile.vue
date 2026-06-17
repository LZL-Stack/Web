<template>
  <div class="profile-page">
    <div class="profile-card">
      <div class="profile-header">
        <div class="profile-avatar">
          <img v-if="form.avatar" :src="form.avatar" alt="avatar" />
          <span v-else class="profile-avatar-text">{{ form.nickname?.charAt(0) || 'U' }}</span>
          <div class="profile-avatar-overlay" @click="pickAvatar">
            <span>📷</span>
          </div>
        </div>
        <h2 class="profile-name">{{ form.nickname || '未设置昵称' }}</h2>
        <p class="profile-bio">{{ form.bio || '这个人很懒，什么都没写' }}</p>
      </div>

      <div class="section-divider"></div>

      <div class="profile-form">
        <div class="form-group">
          <label>昵称</label>
          <input v-model="form.nickname" class="form-input" placeholder="输入昵称" maxlength="20" />
        </div>
        <div class="form-group">
          <label>个人简介</label>
          <textarea v-model="form.bio" class="form-textarea" placeholder="介绍一下自己" rows="3" maxlength="100"></textarea>
        </div>
        <div class="form-group">
          <label>邮箱</label>
          <input v-model="form.email" class="form-input" placeholder="输入邮箱（选填）" />
        </div>
        <div class="form-group">
          <label>头像链接</label>
          <input v-model="form.avatar" class="form-input" placeholder="输入头像图片URL（选填）" />
        </div>

        <div class="form-actions">
          <button class="save-btn" @click="saveProfile">保存修改</button>
          <span v-if="saved" class="save-tip">✅ 已保存</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'

export default {
  name: 'Profile',
  setup() {
    const form = reactive({
      nickname: '',
      bio: '',
      email: '',
      avatar: ''
    })
    const saved = ref(false)

    onMounted(() => {
      try {
        const savedProfile = localStorage.getItem('user_profile')
        if (savedProfile) {
          const data = JSON.parse(savedProfile)
          Object.assign(form, data)
        }
      } catch {}
    })

    function saveProfile() {
      localStorage.setItem('user_profile', JSON.stringify({ ...form }))
      // Sync with App.vue's global profile
      if (window.__PROFILE__) {
        Object.assign(window.__PROFILE__, form)
      }
      saved.value = true
      setTimeout(() => { saved.value = false }, 2000)
    }

    function pickAvatar() {
      const url = prompt('输入头像图片URL地址：')
      if (url) form.avatar = url
    }

    return { form, saved, saveProfile, pickAvatar }
  }
}
</script>

<style scoped>
.profile-page {
  position: relative;
  z-index: 1;
  max-width: 960px;
  margin: 40px auto 60px;
}

.profile-card {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 4px 40px rgba(0, 0, 0, 0.08);
}

.profile-header {
  text-align: center;
  padding: 48px 32px 24px;
  position: relative;
}

.profile-avatar {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7b2d8e, #533483);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  border: 3px solid rgba(255,255,255,0.5);
  box-shadow: 0 4px 16px rgba(123,45,142,0.2);
}
.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.profile-avatar-text {
  color: #fff;
  font-size: 36px;
  font-weight: 700;
}
.profile-avatar-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  border-radius: 50%;
  font-size: 28px;
}
.profile-avatar:hover .profile-avatar-overlay {
  opacity: 1;
}

.profile-name {
  font-size: 24px;
  font-weight: 700;
  color: #2a2a3a;
  margin-bottom: 6px;
}
.profile-bio {
  font-size: 14px;
  color: rgba(100, 80, 140, 0.5);
}

.section-divider {
  height: 2px;
  background: linear-gradient(90deg, #7b2d8e, transparent);
  margin: 0 32px;
  border-radius: 2px;
}

.profile-form {
  padding: 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: rgba(100, 80, 140, 0.5);
  letter-spacing: 0.5px;
}

.form-input, .form-textarea {
  background: rgba(180, 160, 210, 0.08);
  border: 1px solid rgba(180, 160, 210, 0.2);
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 14px;
  color: #2a2a3a;
  outline: none;
  transition: border-color 0.3s;
  font-family: inherit;
}
.form-input:focus, .form-textarea:focus {
  border-color: rgba(123,45,142,0.4);
  box-shadow: 0 0 8px rgba(123,45,142,0.1);
}
.form-input::placeholder, .form-textarea::placeholder {
  color: rgba(100, 80, 140, 0.25);
}
.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 8px;
}
.save-btn {
  padding: 12px 40px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #7b2d8e, #533483);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  letter-spacing: 0.5px;
}
.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(123,45,142,0.3);
}
.save-tip {
  font-size: 14px;
  color: #4caf50;
  animation: fadeIn 0.3s;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateX(-8px); }
  to { opacity: 1; transform: translateX(0); }
}
</style>
