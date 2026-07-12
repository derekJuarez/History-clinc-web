import { Router } from 'express';
import {registrar,modificar,obtener, obtenerPorPaciente } from '../controllers/citas.controller.js';
import { uploadRadiografia } from '../middlewares/upload.middleware.js';

const citasRouter = Router();

citasRouter.post('/registrar', uploadRadiografia.single('radiografia'), registrar);
citasRouter.get('/obtener', obtener);
citasRouter.put('/modificar/:id', modificar);
citasRouter.get('/obtener/:id', obtenerPorPaciente);


export default citasRouter;