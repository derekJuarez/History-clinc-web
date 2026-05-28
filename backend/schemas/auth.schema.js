import { z } from 'zod';

// Ejemplo de validación usando Zod para el inicio de sesión
export const loginSchema = z.object({
    body: z.object({
        matricula: z.string().min(8, 'La matrícula debe tener al menos 8 caracteres'),
        contraseña: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
    })
});
