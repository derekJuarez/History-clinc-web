import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/helpers.util.js';

// Middleware: Verifica si el usuario envió un token válido antes de dejarlo pasar
export const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return errorResponse(res, 403, 'No se proporcionó un token de seguridad');
    }

    try {
        // Suponiendo que usas la palabra 'Bearer ' antes del token
        const tokenString = token.split(' ')[1];
        const decoded = jwt.verify(tokenString, 'TU_SECRETO_AQUI'); // Debería ir en variables de entorno
        
        req.user = decoded; // Guardas la info del usuario en la request
        next(); // Permites que siga a la ruta
    } catch (error) {
        return errorResponse(res, 401, 'Token inválido o expirado');
    }
};

// Middleware genérico para validar esquemas de Zod
export const validateSchema = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (error) {
        return errorResponse(res, 400, error.issues.map(e => e.message).join(', '));
    }
};
