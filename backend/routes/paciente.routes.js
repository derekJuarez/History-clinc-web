import { Router } from 'express';
import { registrar, obtenerTodos } from '../controllers/paciente.controller.js';

const pacienteRouter = Router();

pacienteRouter.post('/registrar', registrar);
pacienteRouter.get('/Todos', obtenerTodos);


export default pacienteRouter;

