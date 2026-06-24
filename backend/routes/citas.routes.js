import { Router } from 'express';
import {registrar} from '../controllers/citas.controller.js';

const citasRouter = Router();

citasRouter.post('/registrar', registrar);

export default citasRouter;