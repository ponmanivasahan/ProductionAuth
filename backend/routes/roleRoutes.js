import express from 'express';
import roleController from '../controllers/roleController.js';
import {authenticate} from '../middleware/auth.js';
import {hasPermission,auditLog} from '../middleware/rbac.js';

const router=express.Router();

router.use(authenticate);

//public routes
router.get('/my-permissions',auditLog('VIEW_MY_PERMISSIONS'),roleController.getMyPermissions);

//Admin routes
router.get('/',hasPermission('role:read'),auditLog('VIEW_ROLES'),roleController.getAllRoles);
router.get('/permissions',hasPermission('role:read'),auditLog('VIEW_PERMISSIONS'),roleController.getAllPermissions);
router.get('/:roleId',hasPermission('role:read'),auditLog('VIEW_ROLE'),roleController.getRoleById);
router.post('/',hasPermission('role:create'),auditLog('CREATE_ROLE'),roleController.createRole);
router.put('/:roleId',hasPermission('role:update'),auditLog('UPDATE_ROLE'),roleController.updateRole);

router.delete('/:roleId',hasPermission('role:delete'),auditLog('DELETE_ROLE'),roleController.deleteRole);
router.post('/:roleId/permissions',hasPermission('role:update'),auditLog('ASSIGN_PERMISSIONS'),roleController.assignPermissions);
router.post('/users/:userId/roles/:roleId',hasPermission('role:assign'),auditLog('ASSIGN_ROLE_TO_USER'),roleController.assignRoleToUser);

router.delete('/users/:userId/roles/:roleId',hasPermission('role:assign'),auditLog('REMOVE_ROLE_FROM_USER'),roleController.removeRoleFromUser);
router.get('/users/:userId/permissions',hasPermission('user:read:all'),auditLog('VIEW_USER_PERMISSIONS'),roleController.getUserPermissions);

router.get('/admin/users',hasPermission('user:read:all'),auditLog('VIEW_ALL_USERS'),roleController.getAllUsersWithRoles);

export default router;