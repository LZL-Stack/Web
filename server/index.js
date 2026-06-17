import Koa from 'koa';
import Router from '@koa/router';
import { koaBody } from 'koa-body';
import serve from 'koa-static';
import cors from '@koa/cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getAllVideos, getVideo, createVideo, deleteVideo } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = new Koa();
const router = new Router();

const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Ensure uploads directory exists
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// CORS
app.use(cors());

// Body parser for file uploads
app.use(koaBody({
  multipart: true,
  formidable: {
    uploadDir: UPLOADS_DIR,
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024 * 1024 // 5GB
  }
}));

// ============ Admin Auth Middleware ============
function requireAdmin(ctx, next) {
  const token = ctx.headers.authorization?.replace('Bearer ', '');
  if (token === 'admin_authenticated') {
    return next();
  }
  ctx.status = 401;
  ctx.body = { success: false, message: '未登录' };
}

// ============ Public Routes ============

// Get all videos
router.get('/api/videos', (ctx) => {
  const videos = getAllVideos().map(v => ({
    ...v,
    url: `/api/videos/${v.id}/stream`
  }));
  ctx.body = { success: true, data: videos };
});

// Get single video details
router.get('/api/videos/:id', (ctx) => {
  const id = parseInt(ctx.params.id);
  const video = getVideo(id);
  if (!video) {
    ctx.status = 404;
    ctx.body = { success: false, message: '视频不存在' };
    return;
  }
  ctx.body = { success: true, data: { ...video, url: `/api/videos/${id}/stream` } };
});

// Stream video with Range support
router.get('/api/videos/:id/stream', async (ctx) => {
  const id = parseInt(ctx.params.id);
  const video = getVideo(id);
  if (!video) {
    ctx.status = 404;
    ctx.body = { success: false, message: '视频不存在' };
    return;
  }

  const filePath = path.join(UPLOADS_DIR, video.filename);
  if (!fs.existsSync(filePath)) {
    ctx.status = 404;
    ctx.body = { success: false, message: '视频文件不存在' };
    return;
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = ctx.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;

    ctx.status = 206;
    ctx.set({
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': video.mimeType
    });

    const stream = fs.createReadStream(filePath, { start, end });
    ctx.body = stream;
  } else {
    ctx.set({
      'Content-Type': video.mimeType,
      'Content-Length': fileSize,
      'Accept-Ranges': 'bytes'
    });
    ctx.body = fs.createReadStream(filePath);
  }
});

// ============ Admin Routes ============

// Admin login
router.post('/api/admin/login', (ctx) => {
  const { password } = ctx.request.body || {};
  if (password === ADMIN_PASSWORD) {
    ctx.body = { success: true, token: 'admin_authenticated' };
  } else {
    ctx.status = 401;
    ctx.body = { success: false, message: '密码错误' };
  }
});

// Upload video
router.post('/api/admin/videos', requireAdmin, async (ctx) => {
  const file = ctx.request.files?.file;
  if (!file) {
    ctx.status = 400;
    ctx.body = { success: false, message: '请选择视频文件' };
    return;
  }

  const { title, description, section } = ctx.request.body || {};
  if (!title) {
    ctx.status = 400;
    ctx.body = { success: false, message: '请输入视频标题' };
    return;
  }

  const video = createVideo({
    title,
    description: description || '',
    section: section || 'latest',
    filename: path.basename(file.filepath),
    originalName: file.originalFilename,
    mimeType: file.mimetype || 'video/mp4',
    size: file.size
  });

  ctx.body = { success: true, data: video };
});

// Delete video
router.delete('/api/admin/videos/:id', requireAdmin, (ctx) => {
  const id = parseInt(ctx.params.id);
  const video = deleteVideo(id);
  if (!video) {
    ctx.status = 404;
    ctx.body = { success: false, message: '视频不存在' };
    return;
  }

  // Delete file
  const filePath = path.join(UPLOADS_DIR, video.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  ctx.body = { success: true, message: '删除成功' };
});

// ============ API Routes (must be before static files) ============
app.use(router.routes());
app.use(router.allowedMethods());

// ============ Serve Static Frontend ============
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  app.use(serve(publicDir));

  // SPA fallback - serve index.html for non-API, non-file routes
  app.use(async (ctx) => {
    if (ctx.status === 404 &&
        !ctx.path.startsWith('/api/') &&
        !ctx.path.startsWith('/uploads/')) {
      ctx.type = 'html';
      ctx.body = fs.createReadStream(path.join(publicDir, 'index.html'));
    }
  });
}

app.listen(PORT, () => {
  console.log(`🚀 视频网站已启动: http://localhost:${PORT}`);
  console.log(`📺 前台首页: http://localhost:${PORT}`);
  console.log(`⚙️  后台管理: http://localhost:${PORT}/admin`);
  console.log(`🔑 默认密码: ${ADMIN_PASSWORD}`);
});
