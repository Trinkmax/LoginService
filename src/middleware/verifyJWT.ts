import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { config } from '../config/env';

// Cliente JWKS para obtener las claves públicas de Clerk
const client = jwksClient({
  jwksUri: `${config.clerk.issuerUrl}/.well-known/jwks.json`,
  cache: true,
  cacheMaxAge: 86400000, // 24 horas
});

// Función para obtener la clave pública
function getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err, undefined);
      return;
    }
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

// Extender el tipo Request para incluir el usuario
declare global {
  namespace Express {
    interface Request {
      user?: {
        clerk_id: string;
        email?: string;
        session_id?: string;
        [key: string]: any;
      };
    }
  }
}

/**
 * Middleware para verificar JWT de Clerk
 * Valida el token JWT enviado desde la aplicación móvil
 */
export const verifyClerkJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'No authorization token provided',
      });
      return;
    }

    const token = authHeader.substring(7); // Remover 'Bearer '

    // Verificar el token usando la clave pública de Clerk
    jwt.verify(
      token,
      getKey,
      {
        issuer: config.clerk.issuerUrl,
        algorithms: ['RS256'],
      },
      (err, decoded) => {
        if (err) {
          console.error('❌ Error verificando JWT:', err.message);
          res.status(401).json({
            success: false,
            error: 'Invalid or expired token',
          });
          return;
        }

        // El token es válido, agregar la información del usuario al request
        req.user = {
          clerk_id: (decoded as any).sub,
          email: (decoded as any).email,
          session_id: (decoded as any).sid,
          ...(decoded as any),
        };

        next();
      }
    );
  } catch (error) {
    console.error('❌ Error en middleware de JWT:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Middleware opcional de JWT (no falla si no hay token)
 */
export const optionalVerifyClerkJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.substring(7);

    jwt.verify(
      token,
      getKey,
      {
        issuer: config.clerk.issuerUrl,
        algorithms: ['RS256'],
      },
      (err, decoded) => {
        if (!err && decoded) {
          req.user = {
            clerk_id: (decoded as any).sub,
            email: (decoded as any).email,
            session_id: (decoded as any).sid,
            ...(decoded as any),
          };
        }
        next();
      }
    );
  } catch (error) {
    next();
  }
};

