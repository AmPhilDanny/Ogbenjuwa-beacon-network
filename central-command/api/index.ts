import type { Request, Response } from 'express';
import app from '../server/dist/app.js';

/**
 * Vercel serverless entry point.
 *
 * Vercel rewrites /api/(.*) to this function. The Express app is pre-configured
 * with routes like /api/v1/auth/login so it can handle the full path directly.
 * If Vercel strips the path (older runtime), we restore it from the
 * x-vercel-forwarded-url header.
 */
export default function handler(req: Request, res: Response) {
  // Vercel may forward the original URL via header — restore it if req.url looks wrong
  const forwarded = req.headers['x-vercel-forwarded-url'] as string | undefined;
  if (forwarded && !req.url?.startsWith('/api/')) {
    req.url = forwarded;
  }

  app(req, res);
}
