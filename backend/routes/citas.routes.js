import { Router } from 'express';
import {registrar,modificar,obtener } from '../controllers/citas.controller.js';
import { uploadRadiografia } from '../middlewares/upload.middleware.js';

const citasRouter = Router();

citasRouter.post('/registrar', uploadRadiografia.single('radiografia'), registrar);
citasRouter.get('/obtener', obtener);
citasRouter.put('/modificar/:id', modificar);


export default citasRouter;