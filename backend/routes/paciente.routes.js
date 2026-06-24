import { Router } from 'express';
import { registrar, obtenerTodos } from '../controllers/paciente.controller.js';

const pacienteRouter = Router();

//post para registrar paciente
pacienteRouter.post('/registrar', registrar);
//get para obtener todos los pacientes
pacienteRouter.get('/todos', obtenerTodos);


export default pacienteRouter;

