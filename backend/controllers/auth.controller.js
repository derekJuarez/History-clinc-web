import jwt from 'jsonwebtoken';
import { findUserByMatricula, createUser } from '../models/user.model.js';
import { successResponse, errorResponse } from '../utils/helpers.util.js';

// Controlador: La lógica real que se ejecuta al llamar al endpoint
export const login = async (req, res) => {
    const { matricula, contraseña } = req.body;

    try {
        // 1. Buscar en la base de datos
        const user = await findUserByMatricula(matricula);

        if (!user) {
            return errorResponse(res, 404, 'Usuario no encontrado');
        }

        // 2. Aquí verificarías la contraseña (ej. usando bcrypt, omitido por simplicidad)
        if (contraseña !== user.Contraseña) {
            return errorResponse(res, 401, 'Contraseña incorrecta');
        }

        // Generar JWT
        const token = jwt.sign(
            { matricula: user.ID_Matricula, rol: user.Id_Rol },
            'TU_SECRETO_AQUI',
            { expiresIn: '24h' }
        );

        // 3. Responder exitosamente
        return successResponse(res, 200, 'Inicio de sesión exitoso', {
            token,
            matricula: user.ID_Matricula,
            nombre: user.Name,
            rol: user.Id_Rol,
            telefono: user.Telefono,
            email: user.Correo
        });

    } catch (error) {
        console.error(error);
        return errorResponse(res, 500, 'Error interno del servidor');
    }
};

// Controlador para registrar un nuevo usuario
export const register = async (req, res) => {
    const { nombre, apellido, matricula, email, telefono, contraseña, id_rol, id_maestro } = req.body;

    try {
        // 1. Verificar si la matrícula ya está registrada
        const existingUser = await findUserByMatricula(matricula);
        if (existingUser) {
            return errorResponse(res, 409, 'La matrícula ya está registrada');
        }

        // 2. Crear el usuario en la base de datos
        const newUserId = await createUser({ nombre, apellido, matricula, email, telefono, contraseña, id_rol, id_maestro });

        // 3. Responder exitosamente
        return successResponse(res, 201, 'Usuario registrado exitosamente', {
            id: newUserId,
            nombre,
            apellido,
            matricula
        });

    } catch (error) {
        console.error(error);
        return errorResponse(res, 500, 'Error interno del servidor al registrar');
    }
};

