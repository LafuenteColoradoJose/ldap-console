import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { DomainController } from '../controllers/domain.controller';
import { GroupController } from '../controllers/group.controller';
import { UserController } from '../controllers/user.controller';
import { ComputerController } from '../controllers/computer.controller';
import { getDashboardStats } from '../controllers/dashboard.controller';

import { TelemetryController } from '../controllers/telemetry.controller';

const router = Router();

// --- Rutas de Telemetría (Heartbeat) sin autenticación ---
router.post('/telemetry/heartbeat', TelemetryController.registerHeartbeat);

import { deployController } from '../controllers/deploy.controller';
router.post('/telemetry/deploy-linux', deployController.deployTelemetry);

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

// --- Rutas de OUs ---
import { OuController } from '../controllers/ou.controller';
router.get('/ous', OuController.getAllOUs);
router.post('/ous', OuController.createOU);
router.put('/ous', OuController.updateOU);
router.delete('/ous', OuController.deleteOU);
router.put('/ous/move', OuController.moveObject);

export default router;
