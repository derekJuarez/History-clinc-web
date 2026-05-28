import { findUserByMatricula } from '../models/user.model.js';
import { successResponse, errorResponse } from '../utils/helpers.util.js';

// Controlador: La lógica real que se ejecuta al llamar al endpoint
export const login = async (req, res) => {
    const { matricula, password } = req.body;

    try {
        // 1. Buscar en la base de datos
        const user = await findUserByMatricula(matricula);

        if (!user) {
            return errorResponse(res, 404, 'Usuario no encontrado');
        }

        // 2. Aquí verificarías la contraseña (ej. usando bcrypt, omitido por simplicidad)
        if (password !== user.contraseña) { 
            return errorResponse(res, 401, 'Contraseña incorrecta');
        }

        // 3. Responder exitosamente
        return successResponse(res, 200, 'Inicio de sesión exitoso', {

            matricula: user.ID_MATRICULA,
            nombre: user.NOMBRE,
            rol: user.Id_Rol,
            telefono: user.TELEFONO,
            email: user.EMAIL
            // Aquí enviarías también tu JWT
        });

    } catch (error) {
        console.error(error);
        return errorResponse(res, 500, 'Error interno del servidor');
    }
};
