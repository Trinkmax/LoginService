import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { AppError } from '../middleware/errorHandler';

export class UserController {
  /**
   * Obtener perfil del usuario autenticado
   */
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.clerk_id) {
        throw new AppError(401, 'No autenticado');
      }

      const user = await userService.getUserByClerkId(req.user.clerk_id);

      if (!user) {
        throw new AppError(404, 'Usuario no encontrado');
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Error obteniendo perfil',
        });
      }
    }
  }

  /**
   * Obtener usuario por ID (admin)
   */
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { clerkId } = req.params;

      const user = await userService.getUserByClerkId(clerkId);

      if (!user) {
        throw new AppError(404, 'Usuario no encontrado');
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Error obteniendo usuario',
        });
      }
    }
  }

  /**
   * Actualizar rol de usuario (admin)
   */
  async updateUserRole(req: Request, res: Response): Promise<void> {
    try {
      const { clerkId } = req.params;
      const { role } = req.body;

      if (!role) {
        throw new AppError(400, 'Role es requerido');
      }

      const user = await userService.updateUser(clerkId, { role });

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Error actualizando rol',
        });
      }
    }
  }

  /**
   * Actualizar estado KYC (admin)
   */
  async updateKYCStatus(req: Request, res: Response): Promise<void> {
    try {
      const { clerkId } = req.params;
      const { kyc_status } = req.body;

      if (!kyc_status) {
        throw new AppError(400, 'KYC status es requerido');
      }

      const user = await userService.updateUser(clerkId, { kyc_status });

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Error actualizando KYC',
        });
      }
    }
  }
}

export const userController = new UserController();

