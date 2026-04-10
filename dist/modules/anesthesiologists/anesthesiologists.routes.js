"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validate_middleware_1 = require("../../shared/middlewares/validate.middleware");
const auth_middleware_1 = require("../../shared/middlewares/auth.middleware");
const anesthesiologists_schema_1 = require("./anesthesiologists.schema");
const anesthesiologists_controller_1 = require("./anesthesiologists.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
// apenas anestesistas
router.post('/profile', (0, auth_middleware_1.requireRole)('ANESTHESIOLOGIST'), (0, validate_middleware_1.validate)(anesthesiologists_schema_1.createAnesthesiologistProfileSchema), anesthesiologists_controller_1.createProfileController);
router.get('/profile', (0, auth_middleware_1.requireRole)('ANESTHESIOLOGIST'), anesthesiologists_controller_1.getProfileController);
router.patch('/profile', (0, auth_middleware_1.requireRole)('ANESTHESIOLOGIST'), (0, validate_middleware_1.validate)(anesthesiologists_schema_1.updateAnesthesiologistProfileSchema), anesthesiologists_controller_1.updateProfileController);
// qualquer usuário autenticado pode listar e ver perfis
router.get('/', anesthesiologists_controller_1.listAnesthesiologistsController);
router.get('/:id', anesthesiologists_controller_1.getAnesthesiologistByIdController);
exports.default = router;
