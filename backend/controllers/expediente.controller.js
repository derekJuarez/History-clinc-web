import {
    guardarInforme,
    getInformesPorMaestro,
    getInformeById,
    getInformesPorAlumno,
    marcarInformeRevisado
} from '../models/informe.model.js';
import { findUserByMatricula } from '../models/user.model.js';
import { successResponse, errorResponse } from '../utils/helpers.util.js';

// POST /api/expedientes/guardar — Alumno sube su informe clínico
export const guardarExpediente = async (req, res) => {
    const { matricula_alumno, paciente, antecedentes, exploracion, odontograma_json } = req.body;

    if (!matricula_alumno || !paciente?.nombre) {
        return errorResponse(res, 400, 'Se requiere la matrícula del alumno y el nombre del paciente');
    }

    try {
        // Obtener nombre del alumno desde usuarios
        const alumno = await findUserByMatricula(matricula_alumno);
        const nombre_alumno = alumno ? alumno.NAME : 'Alumno desconocido';

        const id = await guardarInforme({
            matricula_alumno,
            nombre_alumno,
            nombre_paciente: paciente.nombre,
            telefono_paciente: paciente.telefono,
            fecha_nac_paciente: paciente.fecha_nac,
            sexo_paciente: paciente.sexo,
            ocupacion_paciente: paciente.ocupacion,
            alergias: antecedentes?.alergias,
            medicamentos_actuales: antecedentes?.medicamentos_actuales,
            diabetes: antecedentes?.diabetes || 'No',
            hipertension: antecedentes?.hipertension || 'No',
            problemas_cardiacos: antecedentes?.cardiacos || 'No',
            embarazo: antecedentes?.embarazo || 'No',
            otros_padecimientos: antecedentes?.otros_padecimientos,
            higiene_oral: exploracion?.higiene,
            habitos: exploracion?.habitos,
            oclusion: exploracion?.oclusion,
            estado_atm: exploracion?.atm,
            diagnostico: exploracion?.diagnostico,
            plan_tratamiento: exploracion?.plan,
            odontograma_json
        });

        return successResponse(res, 201, 'Informe clínico guardado exitosamente', { id });
    } catch (error) {
        console.error('Error al guardar expediente:', error);
        return errorResponse(res, 500, 'Error interno al guardar el expediente');
    }
};

// GET /api/expedientes/maestro/:matricula — Maestro ve informes de sus alumnos
export const getExpedientesPorMaestro = async (req, res) => {
    const { matricula } = req.params;
    try {
        const informes = await getInformesPorMaestro(matricula);
        return successResponse(res, 200, 'Informes obtenidos exitosamente', informes);
    } catch (error) {
        console.error('Error al obtener informes del maestro:', error);
        return errorResponse(res, 500, 'Error al obtener los informes');
    }
};

// GET /api/expedientes/:id — Ver un informe completo (para el maestro)
export const getExpedienteById = async (req, res) => {
    const { id } = req.params;
    
    // Fallback: Si el frontend usa caché antiguo y manda un string o teléfono en vez del ID de informe
    if (isNaN(id) || id.length > 10) { 
        req.params.valor = id;
        return buscarPaciente(req, res);
    }

    try {
        const informe = await getInformeById(id);
        if (!informe) return errorResponse(res, 404, 'Informe no encontrado');
        return successResponse(res, 200, 'Informe obtenido exitosamente', informe);
    } catch (error) {
        console.error('Error al obtener informe:', error);
        return errorResponse(res, 500, 'Error al obtener el informe');
    }
};

// GET /api/expedientes/alumno/:matricula — Alumno ve sus propios informes
export const getExpedientesPorAlumno = async (req, res) => {
    const { matricula } = req.params;
    try {
        const informes = await getInformesPorAlumno(matricula);
        return successResponse(res, 200, 'Informes del alumno obtenidos exitosamente', informes);
    } catch (error) {
        console.error('Error al obtener informes del alumno:', error);
        return errorResponse(res, 500, 'Error al obtener informes');
    }
};

// PUT /api/expedientes/:id/revisado — Maestro marca informe como revisado
export const marcarRevisado = async (req, res) => {
    const { id } = req.params;
    try {
        const informe = await getInformeById(id);
        if (!informe) return errorResponse(res, 404, 'Informe no encontrado');
        await marcarInformeRevisado(id);
        return successResponse(res, 200, 'Informe marcado como revisado');
    } catch (error) {
        console.error('Error al marcar informe:', error);
        return errorResponse(res, 500, 'Error al actualizar el informe');
    }
};

import { buscarInformesPorPaciente } from '../models/informe.model.js';

// GET /api/expedientes/buscar/:valor — Alumno busca paciente por nombre o teléfono
export const buscarPaciente = async (req, res) => {
    const { valor } = req.params;
    try {
        const informes = await buscarInformesPorPaciente(valor);
        if (informes.length === 0) {
            return res.status(404).json({ success: false, message: 'Paciente no encontrado' });
        }

        // El primer informe es el más reciente (ORDER BY FECHA_REGISTRO DESC)
        const ultimoInforme = informes[0];

        let odontoJSON = ultimoInforme.ODONTOGRAMA_JSON;
        if (typeof odontoJSON === 'string') {
            try { odontoJSON = JSON.parse(odontoJSON); } catch(e) {}
        }

        const data = {
            success: true,
            paciente: {
                nombre: ultimoInforme.NOMBRE_PACIENTE,
                telefono: ultimoInforme.TELEFONO_PACIENTE,
                fecha_nac: ultimoInforme.FECHA_NAC_PACIENTE,
                sexo: ultimoInforme.SEXO_PACIENTE,
                ocupacion: ultimoInforme.OCUPACION_PACIENTE,
                id_paciente: ultimoInforme.ID_INFORME
            },
            antecedentes: {
                alergias: ultimoInforme.ALERGIAS,
                medicamentos_actuales: ultimoInforme.MEDICAMENTOS_ACTUALES,
                diabetes: ultimoInforme.DIABETES,
                hipertension: ultimoInforme.HIPERTENSION,
                problemas_cardiacos: ultimoInforme.PROBLEMAS_CARDIACOS,
                embarazo: ultimoInforme.EMBARAZO,
                otros_padecimientos: ultimoInforme.OTROS_PADECIMIENTOS
            },
            historial_completo: informes.map(i => {
                let parsedOdonto = i.ODONTOGRAMA_JSON;
                if (typeof parsedOdonto === 'string') {
                    try { parsedOdonto = JSON.parse(parsedOdonto); } catch(e) {}
                }
                return {
                    fecha_registro: i.FECHA_REGISTRO,
                    diagnostico_definitivo: i.DIAGNOSTICO,
                    plan_tratamiento: i.PLAN_TRATAMIENTO,
                    higiene_oral: i.HIGIENE_ORAL,
                    habitos: i.HABITOS,
                    oclusion: i.OCLUSION,
                    estado_atm: i.ESTADO_ATM,
                    odontograma: parsedOdonto
                };
            }),
            historia_actual: {
                higiene_oral: ultimoInforme.HIGIENE_ORAL,
                habitos: ultimoInforme.HABITOS,
                oclusion: ultimoInforme.OCLUSION,
                estado_atm: ultimoInforme.ESTADO_ATM,
                odontograma: odontoJSON
            }
        };

        return res.status(200).json(data);
    } catch (error) {
        console.error('Error al buscar paciente:', error);
        return res.status(500).json({ success: false, message: 'Error interno al buscar paciente' });
    }
};
