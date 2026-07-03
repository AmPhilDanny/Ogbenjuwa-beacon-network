import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { corsOrigins } from './config/env.js';
import { errorHandler } from './middleware/error-handler.js';
import { rateLimit } from './middleware/rate-limit.js';
import { authRouter } from './routes/auth.js';
import { userRouter } from './routes/users.js';
import { lgaRouter } from './routes/lgas.js';
import { alertRouter } from './routes/alerts.js';
import { incidentRouter } from './routes/incidents.js';
import { patrolRouter } from './routes/patrols.js';
import { siteSettingsRouter } from './routes/site-settings.js';
import { uploadRouter } from './routes/uploads.js';
import { communicationsRouter } from './routes/communications.js';
import { smsRouter } from './routes/sms.js';
import { resourceRouter } from './routes/resources.js';
import { familyRouter } from './routes/family.js';
import { villageRouter } from './routes/villages.js';
import { contactRouter } from './routes/contacts.js';
import { alertTypeRouter } from './routes/alert-types.js';
import { auditRouter } from './routes/audit.js';
import { apiKeyRouter } from './routes/api-keys.js';
import { dashboardRouter } from './routes/dashboard.js';
import { pushSubscriptionRouter } from './routes/push-subscriptions.js';
import { notificationPreferencesRouter } from './routes/notification-preferences.js';
import { swaggerRouter } from './routes/swagger.js';

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://unpkg.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
      imgSrc: ["'self'", "data:", "https://*.tile.openstreetmap.org", "https://unpkg.com"],
      connectSrc: ["'self'", "ws://localhost:4001", "http://localhost:4001", "ws://localhost:4000", "http://localhost:4000", "https://*.vercel.app", "https://*.onrender.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://fonts.googleapis.com"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl, etc.)
    if (!origin) return callback(null, true);
    // Allow localhost origins and production Vercel domains
    const allowed = corsOrigins.some(o => origin.startsWith(o)) || origin.endsWith('.vercel.app') || origin.endsWith('.onrender.com');
    callback(null, allowed);
  },
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(rateLimit({ windowMs: 60_000, maxRequests: 200 }));

app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// If an admin frontend build exists, serve it as static files and
// fallback to index.html for SPA routing. This allows the same server
// to host the admin UI at the root path.
try {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const adminDist = path.join(__dirname, '..', 'admin', 'dist');
  if (fs.existsSync(adminDist)) {
    app.use(express.static(adminDist));

    // Serve index.html for non-API routes (SPA fallback)
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) return next();
      res.sendFile(path.join(adminDist, 'index.html'));
    });
  } else {
    // Provide a simple root response for hosting platforms that request "/".
    // Redirect to the health endpoint so browsers and healthchecks see a JSON status.
    app.get('/', (_req, res) => {
      res.redirect('/api/v1/health');
    });
  }
} catch (err) {
  // ignore if the runtime environment doesn't support fileURLToPath
  app.get('/', (_req, res) => {
    res.redirect('/api/v1/health');
  });
}

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/lgas', lgaRouter);
app.use('/api/v1/alerts', alertRouter);
app.use('/api/v1/incidents', incidentRouter);
app.use('/api/v1/patrols', patrolRouter);
app.use('/api/v1/settings', siteSettingsRouter);
app.use('/api/v1/uploads', uploadRouter);
app.use('/api/v1/communications', communicationsRouter);
app.use('/api/v1/sms', smsRouter);
app.use('/api/v1/resources', resourceRouter);
app.use('/api/v1/family', familyRouter);
app.use('/api/v1/villages', villageRouter);
app.use('/api/v1/contacts', contactRouter);
app.use('/api/v1/alert-types', alertTypeRouter);
app.use('/api/v1/audit-logs', auditRouter);
app.use('/api/v1/api-keys', apiKeyRouter);
app.use('/api/v1/dashboard', dashboardRouter);
app.use('/api/v1/push-subscriptions', pushSubscriptionRouter);
app.use('/api/v1/notification-preferences', notificationPreferencesRouter);
app.use('/api/v1/docs', swaggerRouter);

app.use(errorHandler);

export default app;
