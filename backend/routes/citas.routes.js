import { Router } from 'express';
import {registrarCita} from '../controllers/citas.controller.js';

const citasRouter = Router();

citasRouter.post('/registrar', registrarCita);
