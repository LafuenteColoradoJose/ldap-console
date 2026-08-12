import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-2026';

export const requireAuth = (req: Request, res: Response, next: NextFunction): any => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: 'error', message: 'No se proporcionó un token de autenticación o el formato es inválido.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Podemos guardar la info del usuario en req si lo necesitamos para auditoría
    (req as any).user = decoded; 
    next();
  } catch (error) {
    return res.status(401).json({ status: 'error', message: 'Token expirado o inválido.' });
  }
};
