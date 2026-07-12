import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(process.cwd(), '../Frontend/uploads/radiografias')); // Carpeta donde se guardarán los archivos
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '-')); // Nombre del archivo con extensión
    }
});


//filter para aceptar solo imagenes y pdf
const fileFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes y archivos PDF'), false);
    }
};

//crear el middleware de multer y esportar 
export const uploadRadiografia = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Limite de 5MB
});
