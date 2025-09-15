import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validation.middleware';
import { authenticate, authRateLimit } from '../middlewares/auth.middleware';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
} from '../validators/auth.validator';

const router = Router();

/**
 * @route POST /api/v1/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post(
  '/register',
  authRateLimit(5),
  validateRequest(registerSchema),
  AuthController.register,
);

/**
 * @route POST /api/v1/auth/login
 * @desc Login user
 * @access Public
 */
router.post('/login', authRateLimit(5), validateRequest(loginSchema), AuthController.login);

/**
 * @route POST /api/v1/auth/refresh
 * @desc Refresh access token
 * @access Public
 */
router.post(
  '/refresh',
  authRateLimit(10),
  validateRequest(refreshTokenSchema),
  AuthController.refreshToken,
);

/**
 * @route POST /api/v1/auth/logout
 * @desc Logout user (revoke refresh token)
 * @access Public
 */
router.post('/logout', validateRequest(logoutSchema), AuthController.logout);

/**
 * @route POST /api/v1/auth/logout-all
 * @desc Logout from all devices
 * @access Private
 */
router.post('/logout-all', authenticate, AuthController.logoutAll);

/**
 * @route GET /api/v1/auth/sessions
 * @desc Get user's active sessions
 * @access Private
 */
router.get('/sessions', authenticate, AuthController.getSessions);

export default router;
