import { Router } from 'express';
import { registrar } from '../controllers/paciente.controller.js';

const pacienteRouter = Router();

pacienteRouter.post('/registrar', registrar);

export default pacienteRouter;
