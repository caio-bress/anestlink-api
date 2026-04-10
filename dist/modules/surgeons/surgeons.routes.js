"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validate_middleware_1 = require("../../shared/middlewares/validate.middleware");
const auth_middleware_1 = require("../../shared/middlewares/auth.middleware");
const surgeons_schema_1 = require("./surgeons.schema");
const surgeons_controller_1 = require("./surgeons.controller");
const router = (0, express_1.Router)();
// todas as rotas exigem autenticação
router.use(auth_middleware_1.authMiddleware);
// apenas cirurgiões
router.post('/profile', (0, auth_middleware_1.requireRole)('SURGEON'), (0, validate_middleware_1.validate)(surgeons_schema_1.createSurgeonProfileSchema), surgeons_controller_1.createProfileController);
router.get('/profile', (0, auth_middleware_1.requireRole)('SURGEON'), surgeons_controller_1.getProfileController);
router.patch('/profile', (0, auth_middleware_1.requireRole)('SURGEON'), (0, validate_middleware_1.validate)(surgeons_schema_1.updateSurgeonProfileSchema), surgeons_controller_1.updateProfileController);
// qualquer usuário autenticado pode listar cirurgiões
router.get('/', surgeons_controller_1.listSurgeonsController);
exports.default = router;
