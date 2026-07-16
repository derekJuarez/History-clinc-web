import { Router } from 'express';
import { registrar, obtenerTodos, obtenerPorCurp } from '../controllers/paciente.controller.js';

const pacienteRouter = Router();

//post para registrar paciente
pacienteRouter.post('/registrar', registrar);
//get para obtener todos los pacientes
pacienteRouter.get('/todos', obtenerTodos);
pacienteRouter.get('/curp/:curp', obtenerPorCurp);


export default pacienteRouter;

