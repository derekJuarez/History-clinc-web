import { Router } from 'express';
import { obtenerTodos } from '../controllers/maestro.controller.js';

export const maestroRouter = Router();

maestroRouter.get('/todos', obtenerTodos);

export default maestroRouter;

