import { Router } from 'express';
import { google, login, logout, me, register } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// Responses can carry account data or change the session. Never cache them.
router.use((_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

router.post('/register', register);
router.post('/login', login);
router.post('/google', google);
router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, me);

export default router;
