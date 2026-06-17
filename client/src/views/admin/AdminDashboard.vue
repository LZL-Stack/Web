<template>
  <div class="admin-page">
    <div class="admin-header">
      <h1>视频管理</h1>
      <div class="admin-actions">
        <label class="upload-btn">
          {{ uploading ? '上传中...' : '+ 上传视频' }}
          <input
            type="file"
            accept="video/*"
            hidden
            @change="handleUpload"
            :disabled="uploading"
          />
        </label>
        <button @click="logout" class="logout-btn">退出登录</button>
      </div>
    </div>

    <!-- Upload form -->
    <div v-if="showUploadForm" class="upload-form">
      <input
        v-model="uploadTitle"
        placeholder="视频标题（必填）"
        class="input"
      />
      <input
        v-model="uploadDesc"
        placeholder="视频描述（选填）"
        class="input"
      />
      <div class="section-selector">
        <span class="section-label">投放区域：</span>
        <label :class="['section-option', { active: uploadSection === 'hot' }]">
          <input type="radio" v-model="uploadSection" value="hot" />
          🔥 热门推荐
        </label>
        <label :class="['section-option', { active: uploadSection === 'latest' }]">
          <input type="radio" v-model="uploadSection" value="latest" />
          ✦ 最新更新
        </label>
      </div>
      <div class="upload-actions">
        <button @click="confirmUpload" :disabled="!uploadTitle || !selectedFile" class="btn">
          确认上传
        </button>
        <button @click="cancelUpload" class="btn-cancel">取消</button>
      </div>
      <p v-if="uploadError" class="error">{{ uploadError }}</p>
    </div>

    <!-- Video list -->
    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="videos.length === 0" class="empty">
      <p>还没有视频，点击上方按钮上传</p>
    </div>

    <table v-else class="video-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>标题</th>
          <th>区域</th>
          <th>大小</th>
          <th>上传时间</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="video in videos" :key="video.id">
          <td>{{ video.id }}</td>
          <td>
            <router-link :to="`/video/${video.id}`" class="video-link">
              {{ video.title }}
            </router-link>
          </td>
          <td>
            <span :class="['section-tag', video.section === 'hot' ? 'tag-hot' : 'tag-latest']">
              {{ video.section === 'hot' ? '🔥 热门' : '✦ 最新' }}
            </span>
          </td>
          <td>{{ formatSize(video.size) }}</td>
          <td>{{ formatDate(video.createdAt) }}</td>
          <td>
            <button @click="handleDelete(video.id)" class="delete-btn">
              删除
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getVideos, uploadVideo, deleteVideo } from '../../api/index.js'

export default {
  name: 'AdminDashboard',
  setup() {
    const router = useRouter()
    const videos = ref([])
    const loading = ref(true)

    // Upload state
    const showUploadForm = ref(false)
    const selectedFile = ref(null)
    const uploadTitle = ref('')
    const uploadDesc = ref('')
    const uploadSection = ref('hot')
    const uploading = ref(false)
    const uploadError = ref('')

    // Check auth
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin/login')
      return { videos, loading, showUploadForm, selectedFile, uploadTitle, uploadDesc, uploadSection, uploading, uploadError }
    }

    async function loadVideos() {
      try {
        const res = await getVideos()
        if (res.success) videos.value = res.data
      } catch (e) {
        if (e.response?.status === 401) {
          localStorage.removeItem('admin_token')
          router.push('/admin/login')
        }
      } finally {
        loading.value = false
      }
    }

    onMounted(loadVideos)

    function handleUpload(e) {
      const file = e.target.files[0]
      if (!file) return
      selectedFile.value = file
      showUploadForm.value = true
      uploadTitle.value = file.name.replace(/\.[^.]+$/, '') // Default title from filename
      uploadError.value = ''
    }

    function cancelUpload() {
      showUploadForm.value = false
      selectedFile.value = null
      uploadTitle.value = ''
      uploadDesc.value = ''
      uploadSection.value = 'hot'
      uploadError.value = ''
    }

    async function confirmUpload() {
      if (!uploadTitle.value || !selectedFile.value) return

      uploading.value = true
      uploadError.value = ''

      const formData = new FormData()
      formData.append('file', selectedFile.value)
      formData.append('title', uploadTitle.value)
      formData.append('description', uploadDesc.value)
      formData.append('section', uploadSection.value)

      try {
        await uploadVideo(formData)
        cancelUpload()
        await loadVideos()
      } catch (e) {
        uploadError.value = '上传失败，请重试'
      } finally {
        uploading.value = false
      }
    }

    async function handleDelete(id) {
      if (!confirm('确定要删除这个视频吗？')) return
      try {
        await deleteVideo(id)
        await loadVideos()
      } catch (e) {
        alert('删除失败')
      }
    }

    function logout() {
      localStorage.removeItem('admin_token')
      router.push('/admin/login')
    }

    function formatSize(bytes) {
      if (!bytes) return '未知'
      const mb = bytes / 1024 / 1024
      if (mb < 1) return (bytes / 1024).toFixed(1) + ' KB'
      return mb.toFixed(1) + ' MB'
    }

    function formatDate(dateStr) {
      if (!dateStr) return ''
      return dateStr.slice(0, 16).replace('T', ' ')
    }

    return {
      videos, loading,
      showUploadForm, selectedFile, uploadTitle, uploadDesc, uploadSection, uploading, uploadError,
      handleUpload, cancelUpload, confirmUpload, handleDelete, logout,
      formatSize, formatDate
    }
  }
}
</script>

<style scoped>
.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.admin-header h1 {
  font-size: 24px;
}

.admin-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.upload-btn {
  display: inline-block;
  background: #1a1a2e;
  color: #fff;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.upload-btn:hover {
  background: #2d2d4e;
}

.logout-btn {
  padding: 10px 20px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
}

.logout-btn:hover {
  background: #f5f5f5;
}

.upload-form {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.input {
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
}

.input:focus {
  border-color: #1a1a2e;
}

.upload-actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 10px 24px;
  background: #1a1a2e;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-cancel {
  padding: 10px 24px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.error {
  color: #e74c3c;
  font-size: 14px;
}

/* Section Selector */
.section-selector {
  display: flex;
  align-items: center;
  gap: 12px;
}
.section-label {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  white-space: nowrap;
}
.section-option {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 6px;
  border: 2px solid #eee;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  background: #fafafa;
}
.section-option input { display: none; }
.section-option.active {
  border-color: #7b2d8e;
  background: rgba(123,45,142,0.06);
  color: #7b2d8e;
}
.section-option:hover {
  border-color: #b088d6;
}
.section-option:first-child.active { border-color: #e74c3c; background: rgba(231,76,60,0.06); color: #e74c3c; }
.section-option:last-child.active { border-color: #7b2d8e; background: rgba(123,45,142,0.06); color: #7b2d8e; }

/* Section Tag */
.section-tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}
.tag-hot { background: rgba(231,76,60,0.1); color: #e74c3c; }
.tag-latest { background: rgba(123,45,142,0.1); color: #7b2d8e; }

.loading, .empty {
  text-align: center;
  padding: 60px 0;
  color: #888;
}

.video-table {
  width: 100%;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  border-collapse: collapse;
}

.video-table th {
  background: #f8f8f8;
  padding: 12px 16px;
  text-align: left;
  font-size: 13px;
  color: #666;
  font-weight: 600;
}

.video-table td {
  padding: 12px 16px;
  border-top: 1px solid #eee;
  font-size: 14px;
}

.video-link {
  color: #1a1a2e;
  text-decoration: none;
  font-weight: 500;
}

.video-link:hover {
  text-decoration: underline;
}

.delete-btn {
  padding: 6px 14px;
  background: #fff;
  color: #e74c3c;
  border: 1px solid #e74c3c;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.delete-btn:hover {
  background: #e74c3c;
  color: #fff;
}
</style>
