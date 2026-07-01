import express from 'express';
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
      connectSrc: ["'self'", "ws://localhost:4001", "http://localhost:4001"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://fonts.googleapis.com"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({
  origin: corsOrigins,
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
