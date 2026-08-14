import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { DomainController } from '../controllers/domain.controller';
import { GroupController } from '../controllers/group.controller';
import { UserController } from '../controllers/user.controller';
import { ComputerController } from '../controllers/computer.controller';
import { getDashboardStats } from '../controllers/dashboard.controller';

const router = Router();

// Middleware global para todas las rutas API a partir de aquí
router.use(requireAuth);

// --- Rutas del Dominio ---
router.get('/domain/info', DomainController.getInfo);
router.get('/domain/structure', DomainController.getStructure);

// --- Rutas de Grupos ---
router.get('/groups', GroupController.getAllGroups);
router.get('/groups/:name', GroupController.getGroup);
router.post('/groups', GroupController.createGroup);
router.put('/groups/:name', GroupController.updateGroup);
router.delete('/groups/:name', GroupController.deleteGroup);
router.post('/groups/:name/members', GroupController.addMember);
router.delete('/groups/:name/members/:memberCn', GroupController.removeMember);

// --- Rutas de Usuarios ---
router.get('/users', UserController.getAllUsers);
router.get('/users/:username', UserController.getUser);
router.post('/users', UserController.createUser);
router.put('/users/:cn', UserController.updateUser);
router.put('/users/:cn/status', UserController.toggleUserStatus);
router.delete('/users/:cn', UserController.deleteUser);

// --- Rutas de Equipos ---
router.get('/computers', ComputerController.getAllComputers);

// --- Rutas del Dashboard ---
router.get('/dashboard/stats', getDashboardStats);

export default router;
