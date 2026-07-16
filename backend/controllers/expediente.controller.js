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
        const nombre_alumno = alumno ? (alumno.Nombre || alumno.NAME || alumno.Name || 'Alumno desconocido') : 'Alumno desconocido';

        const id = await guardarInforme({
            matricula_alumno,
            nombre_alumno,
            nombre_paciente: paciente.nombre,
            telefono_paciente: paciente.telefono,
            fecha_nac_paciente: paciente.fecha_nac,
            sexo_paciente: paciente.sexo,
            ocupacion_paciente: paciente.ocupacion,
            curp_paciente: paciente.curp,
            medico_cabecera: paciente.medico_cabecera,
            
            alergias_flags: antecedentes?.alergias_flags,
            tabaquismo: antecedentes?.tabaquismo || 'No',
            alcoholismo: antecedentes?.alcoholismo || 'No',
            drogadiccion: antecedentes?.drogadiccion || 'No',
            cardiovascular_data: antecedentes?.cardiovascular_data,
            endocrino_data: antecedentes?.endocrino_data,
            hematologico_data: antecedentes?.hematologico_data,
            infectocontagiosas_data: antecedentes?.infectocontagiosas_data,
            
            medicamentos_actuales: antecedentes?.medicamentos_actuales,
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
        return errorResponse(res, 500, 'Error interno al guardar el expediente: ' + error.message);
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

import db from '../config/db.js';

// GET /api/expedientes/buscar/:valor — Alumno busca paciente por nombre o teléfono
export const buscarPaciente = async (req, res) => {
    const { valor } = req.params;
    try {
        const informes = await buscarInformesPorPaciente(valor);
        if (informes.length === 0) {
            return res.status(404).json({ success: false, message: 'Paciente no encontrado' });
        }

        const ultimoInforme = informes[0];
        const idPaciente = ultimoInforme.Id_Paciente;

        // Buscar antecedentes y hábitos del paciente
        const [antecedentes] = await db.query('SELECT Categoria, Detalle FROM antecedentes_paciente WHERE Id_Paciente = ?', [idPaciente]);
        const [habitos] = await db.query('SELECT Habito FROM habitos_paciente WHERE Id_Paciente = ?', [idPaciente]);

        const getAnt = (cat) => antecedentes.find(a => a.Categoria === cat)?.Detalle || 'No';

        let odontoJSON = ultimoInforme.OdontogramaJSON;
        if (typeof odontoJSON === 'string') {
            try { odontoJSON = JSON.parse(odontoJSON); } catch(e) {}
        }

        const data = {
            success: true,
            paciente: {
                nombre: ultimoInforme.NOMBRE_PACIENTE,
                telefono: ultimoInforme.TELEFONO_PACIENTE,
                fecha_nac: ultimoInforme.FechaNacimiento,
                sexo: ultimoInforme.Sexo,
                ocupacion: ultimoInforme.Ocupacion,
                id_paciente: ultimoInforme.Id_Informe
            },
            antecedentes: {
                alergias: ultimoInforme.Alergias_Flags || '',
                tabaquismo: ultimoInforme.Tabaquismo || 'No',
                alcoholismo: ultimoInforme.Alcoholismo || 'No',
                drogadiccion: ultimoInforme.Drogadiccion || 'No',
                cardiovascular_data: ultimoInforme.Cardiovascular_Data || '',
                endocrino_data: ultimoInforme.Endocrino_Data || '',
                hematologico_data: ultimoInforme.Hematologico_Data || '',
                infectocontagiosas_data: ultimoInforme.Infectocontagiosas_Data || '',
                medicamentos_actuales: getAnt('Medicamentos'),
                otros_padecimientos: getAnt('Otros')
            },
            historial_completo: informes.map(i => {
                let parsedOdonto = i.OdontogramaJSON;
                if (typeof parsedOdonto === 'string') {
                    try { parsedOdonto = JSON.parse(parsedOdonto); } catch(e) {}
                }
                return {
                    fecha_registro: i.FechaRegistro,
                    diagnostico_definitivo: i.Diagnostico,
                    plan_tratamiento: i.PlanTratamiento,
                    higiene_oral: i.HigieneOral,
                    habitos: habitos.map(h => h.Habito).join(', '),
                    oclusion: 'Normal', // Ya no está en BD
                    estado_atm: i.ATM,
                    odontograma: parsedOdonto
                };
            }),
            historia_actual: {
                higiene_oral: ultimoInforme.HigieneOral,
                habitos: habitos.map(h => h.Habito).join(', '),
                oclusion: 'Normal',
                estado_atm: ultimoInforme.ATM,
                odontograma: odontoJSON
            }
        };

        return res.status(200).json(data);
    } catch (error) {
        console.error('Error al buscar paciente:', error);
        return res.status(500).json({ success: false, message: 'Error interno al buscar paciente' });
    }
};
