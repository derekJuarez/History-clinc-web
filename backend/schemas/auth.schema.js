import { z } from 'zod';

// Ejemplo de validación usando Zod para el inicio de sesión
export const loginSchema = z.object({
    body: z.object({
        matricula: z.string().min(5, 'La matrícula debe tener al menos 5 caracteres'),
        contraseña: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
    })
});

// Validación para el registro de usuario
export const registerSchema = z.object({
    body: z.object({
        nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
        apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
        matricula: z.string().min(8, 'La matrícula debe tener al menos 8 caracteres'),
        email: z.string().email('El email no es válido'),
        telefono: z.string().min(10, 'El teléfono debe tener al menos 10 dígitos'),
        contraseña: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
        id_rol: z.number().int().positive('El rol es requerido'),
        id_maestro: z.string().nullable().optional()
    })
});

