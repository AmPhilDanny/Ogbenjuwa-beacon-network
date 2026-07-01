import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import db from '../config/db.js';
import { fileUploads } from '../db/schema/index.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

const UPLOAD_DIR = path.resolve('uploads');
// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = crypto.randomBytes(16).toString('hex');
    cb(null, `${name}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

router.use(authenticate);

router.post('/', requireRole('super_admin'), upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: { code: 'NO_FILE', message: 'No file provided' } });
      return;
    }

    const bucket = (req.body.bucket as string) || 'general';

    const [file] = await db.insert(fileUploads).values({
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
      bucket,
      storagePath: req.file.path,
      uploadedBy: req.user!.id,
    }).returning();

    res.status(201).json(file);
  } catch (err) {
    next(err);
  }
});

router.get('/', requireRole('super_admin'), async (req, res, next) => {
  try {
    const bucket = req.query.bucket as string;
    const query = db.select().from(fileUploads).orderBy(fileUploads.createdAt);
    const all = bucket
      ? await query.where(eq(fileUploads.bucket, bucket))
      : await query;
    res.json({ data: all });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [file] = await db.select().from(fileUploads).where(eq(fileUploads.id, req.params.id as string));
    if (!file) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'File not found' } });
      return;
    }
    // Serve the file
    res.sendFile(file.storagePath);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireRole('super_admin'), async (req, res, next) => {
  try {
    const [file] = await db.select().from(fileUploads).where(eq(fileUploads.id, req.params.id as string));
    if (!file) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'File not found' } });
      return;
    }
    // Delete from disk
    fs.unlink(file.storagePath, () => {});
    // Delete from DB
    await db.delete(fileUploads).where(eq(fileUploads.id, file.id));
    res.json({ message: 'File deleted' });
  } catch (err) {
    next(err);
  }
});

export { router as uploadRouter };
