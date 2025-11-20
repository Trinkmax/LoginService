import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { verifyClerkJWT } from '../middleware/verifyJWT';

const router = Router();

/**
 * GET /users/profile
 * Obtener perfil del usuario autenticado
 */
router.get('/profile', verifyClerkJWT, userController.getProfile.bind(userController));

/**
 * GET /users/:clerkId
 * Obtener usuario por Clerk ID (requiere autenticación)
 */
router.get('/:clerkId', verifyClerkJWT, userController.getUserById.bind(userController));

/**
 * PATCH /users/:clerkId/role
 * Actualizar rol de usuario (admin)
 */
router.patch('/:clerkId/role', verifyClerkJWT, userController.updateUserRole.bind(userController));

/**
 * PATCH /users/:clerkId/kyc
 * Actualizar estado KYC (admin)
 */
router.patch('/:clerkId/kyc', verifyClerkJWT, userController.updateKYCStatus.bind(userController));

export default router;

