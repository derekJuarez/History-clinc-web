// Utils: Funciones de ayuda reutilizables
// Ejemplo: Formatear una respuesta exitosa
export const successResponse = (res, status, message, data = null) => {
    return res.status(status).json({
        success: true,
        message,
        data
    });
};

export const errorResponse = (res, status, message) => {
    return res.status(status).json({
        success: false,
        message
    });
};
