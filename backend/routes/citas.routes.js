import { Router } from 'express';
import {registrar,modificar,obtener } from '../controllers/citas.controller.js';

const citasRouter = Router();

citasRouter.post('/registrar', registrar);
citasRouter.get('/obtener', obtener);
citasRouter.put('/modificar/:id', modificar);

export default citasRouter;