import { Request, Response, NextFunction } from 'express';
import { Role } from '../shared/constants.js';
import { hasPermission, hasRole } from '../shared/permissions.js';
import type { JwtPayload } from './auth.js';

export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user as JwtPayload | undefined;
    if (!user) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
      return;
    }

    if (!allowedRoles.includes(user.role as Role)) {
      res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: `Requires one of roles: ${allowedRoles.join(', ')}`,
        },
      });
      return;
    }

    next();
  };
}

export function requirePermission(resource: string, action: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user as JwtPayload | undefined;
    if (!user) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
      return;
    }

    if (!hasPermission(user.role as Role, `${resource}:${action}`)) {
      res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: `Missing permission: ${resource}:${action}`,
        },
      });
      return;
    }

    next();
  };
}

export function requireHierarchy(minRole: Role) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user as JwtPayload | undefined;
    if (!user) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
      return;
    }

    if (!hasRole(user.role as Role, minRole)) {
      res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: `Requires minimum role: ${minRole}`,
        },
      });
      return;
    }

    next();
  };
}
