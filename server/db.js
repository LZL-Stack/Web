import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'data', 'videos.json');

function initDB() {
  const dir = path.dirname(DB_PATH);
  fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ videos: [], nextId: 1 }, null, 2));
  }
}

function readDB() {
  initDB();
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  } catch {
    return { videos: [], nextId: 1 };
  }
}

function writeDB(data) {
  initDB();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export function getAllVideos() {
  return readDB().videos;
}

export function getVideo(id) {
  const db = readDB();
  return db.videos.find(v => v.id === id) || null;
}

export function createVideo({ title, description, filename, originalName, mimeType, size, section }) {
  const db = readDB();
  const video = {
    id: db.nextId++,
    title,
    description: description || '',
    filename,
    originalName,
    mimeType: mimeType || 'video/mp4',
    size: size || 0,
    section: section || 'latest',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.videos.push(video);
  writeDB(db);
  return video;
}

export function updateVideo(id, updates) {
  const db = readDB();
  const idx = db.videos.findIndex(v => v.id === id);
  if (idx === -1) return null;
  db.videos[idx] = {
    ...db.videos[idx],
    ...updates,
    id,
    updatedAt: new Date().toISOString()
  };
  writeDB(db);
  return db.videos[idx];
}

export function deleteVideo(id) {
  const db = readDB();
  const idx = db.videos.findIndex(v => v.id === id);
  if (idx === -1) return null;
  const [video] = db.videos.splice(idx, 1);
  writeDB(db);
  return video;
}
