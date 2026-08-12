import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { DomainController } from '../controllers/domain.controller';
import { GroupController } from '../controllers/group.controller';
import { UserController } from '../controllers/user.controller';

const router = Router();

// Middleware global para todas las rutas API a partir de aquí
router.use(requireAuth);

// --- Rutas del Dominio ---
router.get('/domain/info', DomainController.getInfo);
router.get('/domain/structure', DomainController.getStructure);

// --- Rutas de Grupos ---
router.get('/groups/:name', GroupController.getGroup);
router.post('/groups', GroupController.createGroup);
router.delete('/groups/:name', GroupController.deleteGroup);

// --- Rutas de Usuarios ---
router.get('/users/:username', UserController.getUser);
router.post('/users', UserController.createUser);
router.delete('/users/:cn', UserController.deleteUser);

export default router;
