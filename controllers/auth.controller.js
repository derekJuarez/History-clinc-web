import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { findUserByMatricula, createUser, updateUserProfile } from '../models/user.model.js';
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

        // 2. Aquí verifico la contraseña
        const dbContraseña = user.Contrasena || user.Contraseña || user.CONTRASEÑA;
        const isMatch = await bcrypt.compare(contraseña, dbContraseña);
        
        if (!isMatch) {
            return errorResponse(res, 401, 'Contraseña incorrecta');
        }

        const dbMatricula = user.ID_MATRICULA || user.ID_Matricula;
        const dbRol = user.Id_Rol || user.ID_ROL;
        const dbNombre = user.Nombre || user.NAME || user.Name;
        const dbTelefono = user.Telefono || user.TELEFONO;
        const dbEmail = user.Correo || user.CORREO;

        // Generar JWT
        const token = jwt.sign(
            { matricula: dbMatricula, rol: dbRol },
            process.env.JWT_SECRET || 'fallback_secreto',
            { expiresIn: '24h' }
        );

        // 3. Responder exitosamente
        return successResponse(res, 200, 'Inicio de sesión exitoso', {
            token,
            matricula: dbMatricula,
            nombre: dbNombre,
            rol: dbRol,
            telefono: dbTelefono,
            email: dbEmail
        });

    } catch (error) {
        console.error(error);
        return errorResponse(res, 500, 'Error interno del servidor');
    }
};

// Controlador para registrar un nuevo usuario
export const register = async (req, res) => {
    const { nombre, apellido, matricula, email, telefono, contraseña, id_rol, id_maestro } = req.body;

    console.log(`[DEBUG REGISTER] Rol: ${id_rol}, id_maestro: "${id_maestro}" (tipo: ${typeof id_maestro})`);

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

// Obtener perfil del usuario autenticado
export const getProfile = async (req, res) => {
    try {
        const { matricula } = req.user;
        const user = await findUserByMatricula(matricula);

        if (!user) {
            return errorResponse(res, 404, 'Usuario no encontrado');
        }

        return successResponse(res, 200, 'Perfil obtenido con éxito', {
            matricula: user.ID_MATRICULA || user.ID_Matricula,
            nombre: user.Nombre || user.NAME || user.Name,
            email: user.Correo || user.CORREO,
            telefono: user.Telefono || user.TELEFONO,
            rol: user.Id_Rol,
            maestro: user.Maestro_Asignado
        });
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        return errorResponse(res, 500, 'Error interno del servidor al obtener perfil');
    }
};

// Actualizar perfil del usuario autenticado
export const updateProfile = async (req, res) => {
    try {
        const { matricula } = req.user;
        const { nombre, email, telefono, contraseña } = req.body;

        if (!nombre || !email || !telefono) {
            return errorResponse(res, 400, 'El nombre, correo electrónico y teléfono son obligatorios');
        }

        await updateUserProfile(matricula, { nombre, email, telefono, contraseña });

        return successResponse(res, 200, 'Perfil actualizado con éxito');
    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        return errorResponse(res, 500, 'Error interno del servidor al actualizar perfil');
    }
};

