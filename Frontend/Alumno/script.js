const coloresDiagnostico = { 'sano': 'white', 'caries': '#ef4444', 'resina': '#3b82f6', 'sellante': '#22c55e', 'faltante': '#1e293b' };
const piezasSuperiores = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const piezasInferiores = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

let historialPacienteActual = [];

function crearDienteSVG(numero) {
    return `
        <div class="text-center tooth-box">
            <div class="fw-bold text-secondary small mb-2">${numero}</div>
            <svg width="45" height="45" viewBox="0 0 100 100" class="diente" id="d-${numero}">
                <polygon points="0,0 100,0 75,25 25,25" fill="white" stroke="#64748b" stroke-width="2" class="cara" data-cara="arriba" data-estado="sano"/>
                <polygon points="0,100 100,100 75,75 25,75" fill="white" stroke="#64748b" stroke-width="2" class="cara" data-cara="abajo" data-estado="sano"/>
                <polygon points="0,0 25,25 25,75 0,100" fill="white" stroke="#64748b" stroke-width="2" class="cara" data-cara="izq" data-estado="sano"/>
                <polygon points="100,0 75,25 75,75 100,100" fill="white" stroke="#64748b" stroke-width="2" class="cara" data-cara="der" data-estado="sano"/>
                <rect x="25" y="25" width="50" height="50" fill="white" stroke="#64748b" stroke-width="2" class="cara" data-cara="centro" data-estado="sano"/>
            </svg>
        </div>
    `;
}

// Inicializar el odontograma de forma dinámica
const containerSuperior = document.getElementById('arcada-superior');
const containerInferior = document.getElementById('arcada-inferior');
if (containerSuperior && containerInferior) {
    piezasSuperiores.forEach(num => containerSuperior.innerHTML += crearDienteSVG(num));
    piezasInferiores.forEach(num => containerInferior.innerHTML += crearDienteSVG(num));
}

let colorActual = 'white';
let diagnosticoActual = 'sano';
document.querySelectorAll('.opcion-diagnostico').forEach(radio => {
    radio.addEventListener('change', function () {
        colorActual = this.getAttribute('data-color');
        diagnosticoActual = this.value;
    });
});

document.addEventListener('click', function (e) {
    if (e.target && e.target.classList.contains('cara')) {
        e.target.setAttribute('fill', colorActual);
        e.target.setAttribute('data-estado', diagnosticoActual);
    }
});

function limpiarGrafico() {
    document.querySelectorAll('.cara').forEach(cara => {
        cara.setAttribute('fill', 'white');
        cara.setAttribute('data-estado', 'sano');
    });
}

const fechaNacInput = document.getElementById('fecha_nac');
if (fechaNacInput) {
    fechaNacInput.addEventListener('change', function () {
        if (this.value) {
            const hoy = new Date();
            const cumpleanos = new Date(this.value);
            let edad = hoy.getFullYear() - cumpleanos.getFullYear();
            const m = hoy.getMonth() - cumpleanos.getMonth();
            if (m < 0 || (m === 0 && hoy.getDate() < cumpleanos.getDate())) { edad--; }
            const edadInput = document.getElementById('edad');
            if (edadInput) edadInput.value = edad;
        }
    });
}

// --- BÚSQUEDA Y LLENADO ---
function mostrarFormularioNuevoPaciente() {
    const contenedor = document.getElementById('contenedorDatos');
    contenedor.style.display = 'block';
    document.getElementById('statusBusqueda').innerHTML = '';
    
    const tabFormulario = new bootstrap.Tab(document.getElementById('tab-formulario'));
    tabFormulario.show();

    document.getElementById('resumenNombre').innerText = "Registro de Nuevo Paciente";
    document.getElementById('resumenDetalles').innerText = "Por favor, completa el expediente clínico.";
    document.getElementById('displayId').innerText = "NUEVO";

    document.getElementById('formHistoriaClinica').reset();
    limpiarGrafico();
    document.getElementById('tablaHistorial').innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">Paciente nuevo. Completa el formulario para registrar su primera visita.</td></tr>';
    
    document.getElementById('nombre').value = '';
    document.getElementById('telefono').value = '';
    const buscarValor = document.getElementById('buscarValor').value;
    if (/^\d+$/.test(buscarValor)) {
        document.getElementById('telefono').value = buscarValor;
    } else {
        document.getElementById('nombre').value = buscarValor;
    }
}

async function buscarPaciente() {
    const valorBusqueda = document.getElementById('buscarValor').value;
    const status = document.getElementById('statusBusqueda');
    const contenedor = document.getElementById('contenedorDatos');

    if (!valorBusqueda) {
        status.innerHTML = '<span class="text-danger fw-bold"><i class="bi bi-exclamation-circle me-1"></i>Escribe un nombre o número</span>';
        return;
    }

    status.innerHTML = '<div class="spinner-border text-primary spinner-border-sm me-2" role="status"></div><span class="text-primary fw-bold">Buscando en la base de datos...</span>';

    try {
        const respuesta = await fetch(`/api/expedientes/buscar/${valorBusqueda}`);
        const data = await respuesta.json();

        contenedor.style.display = 'block';
        status.innerHTML = '';

        if (respuesta.ok && data.success) {
            const tabHistorial = new bootstrap.Tab(document.getElementById('tab-historial'));
            tabHistorial.show();

            document.getElementById('resumenNombre').innerText = data.paciente.nombre || 'Nombre no registrado';
            document.getElementById('resumenDetalles').innerText = `Teléfono: ${data.paciente.telefono} | Sexo: ${data.paciente.sexo || 'N/A'}`;
            document.getElementById('displayId').innerText = `ID: #${data.paciente.id_paciente}`;

            document.getElementById('nombre').value = data.paciente.nombre || '';
            document.getElementById('telefono').value = data.paciente.telefono || '';

            if (data.paciente.fecha_nac) {
                try {
                    const fechaObj = new Date(data.paciente.fecha_nac);
                    document.getElementById('fecha_nac').value = fechaObj.toISOString().split('T')[0];
                    document.getElementById('fecha_nac').dispatchEvent(new Event('change'));
                } catch (e) { }
            }
            document.getElementById('sexo').value = data.paciente.sexo || '';
            document.getElementById('ocupacion').value = data.paciente.ocupacion || '';

            if (data.antecedentes) {
                document.getElementById('alergias').value = data.antecedentes.alergias || '';
                document.getElementById('medicamentos_actuales').value = data.antecedentes.medicamentos_actuales || '';
                document.getElementById('diabetes').value = data.antecedentes.diabetes || 'No';
                document.getElementById('hipertension').value = data.antecedentes.hipertension || 'No';
                document.getElementById('cardiacos').value = data.antecedentes.problemas_cardiacos || 'No';
                document.getElementById('embarazo').value = data.antecedentes.embarazo || 'No';
                document.getElementById('otros_padecimientos').value = data.antecedentes.otros_padecimientos || '';
            }

            const tbody = document.getElementById('tablaHistorial');
            tbody.innerHTML = '';
            historialPacienteActual = data.historial_completo || [];

            if (historialPacienteActual.length > 0) {
                historialPacienteActual.forEach((visita, index) => {
                    const fechaFormateada = new Date(visita.fecha_registro).toLocaleDateString('es-MX', {
                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    });
                    tbody.innerHTML += `
                        <tr>
                            <td><span class="badge bg-secondary">${fechaFormateada}</span></td>
                            <td class="text-truncate" style="max-width: 250px;" title="${visita.diagnostico_definitivo || '-'}">${visita.diagnostico_definitivo || '-'}</td>
                            <td class="text-truncate" style="max-width: 250px;" title="${visita.plan_tratamiento || '-'}">${visita.plan_tratamiento || '-'}</td>
                            <td>${visita.higiene_oral || '-'}</td>
                            <td class="text-center">
                                <button type="button" class="btn btn-sm btn-outline-primary fw-bold px-3" onclick="verDetalleVisita(${index})">
                                    <i class="bi bi-eye-fill me-1"></i> Ver Completa
                                </button>
                            </td>
                        </tr>
                    `;
                });
            } else {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4"><i class="bi bi-folder2-open fs-3 d-block mb-2"></i> No hay consultas previas para este paciente.</td></tr>';
            }

            if (data.historia_actual) {
                document.getElementById('diagnostico').value = "";
                document.getElementById('plan_treatment').value = "";
                document.getElementById('higiene').value = data.historia_actual.higiene_oral || 'Buena';
                document.getElementById('habitos').value = data.historia_actual.habitos || '';
                document.getElementById('oclusion').value = data.historia_actual.oclusion || '';
                document.getElementById('atm').value = data.historia_actual.estado_atm || '';

                let odontoJSON = data.historia_actual.odontograma;
                if (typeof odontoJSON === 'string') {
                    try { odontoJSON = JSON.parse(odontoJSON); } catch (e) { }
                }
                if (odontoJSON && typeof odontoJSON === 'object') {
                    limpiarGrafico();
                    for (const [numDiente, caras] of Object.entries(odontoJSON)) {
                        for (const [nombreCara, estadoCara] of Object.entries(caras)) {
                            const elementoCara = document.querySelector(`#d-${numDiente} .cara[data-cara="${nombreCara}"]`);
                            if (elementoCara) {
                                elementoCara.setAttribute('fill', coloresDiagnostico[estadoCara] || 'white');
                                elementoCara.setAttribute('data-estado', estadoCara);
                            }
                        }
                    }
                }
            }
        } else {
            contenedor.style.display = 'none';
            status.innerHTML = '<span class="text-warning fw-bold"><i class="bi bi-exclamation-triangle me-1"></i>Paciente no encontrado. Usa el botón "Nueva" para registrarlo.</span>';
        }
    } catch (error) {
        console.error(error);
        status.innerHTML = '<span class="text-danger fw-bold"><i class="bi bi-x-circle me-1"></i>Error conectando al servidor</span>';
    }
}

function verDetalleVisita(index) {
    const visita = historialPacienteActual[index];
    if (!visita) return;

    const fechaFormateada = new Date(visita.fecha_registro).toLocaleDateString('es-MX', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    document.getElementById('detalleFecha').innerText = fechaFormateada;
    document.getElementById('detalleHigiene').innerText = visita.higiene_oral || 'No especificada';
    document.getElementById('detalleHabitos').innerText = visita.habitos || 'Ninguno';
    document.getElementById('detalleOclusion').innerText = visita.oclusion || 'No especificada';
    document.getElementById('detalleATM').innerText = visita.estado_atm || 'No especificado';
    document.getElementById('detalleDiagnostico').innerText = visita.diagnostico_definitivo || 'Sin registro';
    document.getElementById('detallePlan').innerText = visita.plan_tratamiento || 'Sin registro';

    const myModal = new bootstrap.Modal(document.getElementById('modalDetalleVisita'));
    myModal.show();
}

// CORRECCIÓN: Limpiar odontograma y cajas de texto de consulta al abrir la pestaña de "Registrar Nueva Consulta"
const tabFormulario = document.getElementById('tab-formulario');
if (tabFormulario) {
    tabFormulario.addEventListener('click', function () {
        const firstSubTab = new bootstrap.Tab(document.getElementById('btn-identificacion'));
        firstSubTab.show();

        limpiarGrafico();
        document.getElementById('diagnostico').value = "";
        document.getElementById('plan_treatment').value = "";
    });
}

const buscarValorInput = document.getElementById('buscarValor');
if (buscarValorInput) {
    buscarValorInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); buscarPaciente(); }
    });
}

// --- GUARDADO ---
const formHistoriaClinica = document.getElementById('formHistoriaClinica');
if (formHistoriaClinica) {
    formHistoriaClinica.addEventListener('submit', async function (e) {
        e.preventDefault();

        const matricula_alumno = localStorage.getItem('matricula');
        if (!matricula_alumno) {
            mostrarToastAlumno('error', 'No se encontró tu sesión. Por favor inicia sesión nuevamente.');
            return;
        }

        const btnGuardar = this.querySelector('[type="submit"]');
        btnGuardar.disabled = true;
        btnGuardar.innerHTML = '<i class="bi bi-hourglass-split me-2"></i> Guardando...';

        const estadoOdontograma = {};
        document.querySelectorAll('.diente').forEach(diente => {
            const numDiente = diente.id.replace('d-', '');
            estadoOdontograma[numDiente] = {};
            diente.querySelectorAll('.cara').forEach(cara => {
                estadoOdontograma[numDiente][cara.getAttribute('data-cara')] = cara.getAttribute('data-estado');
            });
        });

        const datosCompletos = {
            matricula_alumno,
            paciente: {
                nombre: document.getElementById('nombre').value,
                telefono: document.getElementById('telefono').value,
                fecha_nac: document.getElementById('fecha_nac').value,
                sexo: document.getElementById('sexo').value,
                ocupacion: document.getElementById('ocupacion').value
            },
            antecedentes: {
                alergias: document.getElementById('alergias').value,
                medicamentos_actuales: document.getElementById('medicamentos_actuales').value,
                diabetes: document.getElementById('diabetes').value,
                hipertension: document.getElementById('hipertension').value,
                cardiacos: document.getElementById('cardiacos').value,
                embarazo: document.getElementById('embarazo').value,
                otros_padecimientos: document.getElementById('otros_padecimientos').value
            },
            exploracion: {
                higiene: document.getElementById('higiene').value,
                habitos: document.getElementById('habitos').value,
                oclusion: document.getElementById('oclusion').value,
                atm: document.getElementById('atm').value,
                diagnostico: document.getElementById('diagnostico').value,
                plan: document.getElementById('plan_treatment').value
            },
            odontograma_json: estadoOdontograma
        };

        try {
            const response = await fetch('/api/expedientes/guardar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosCompletos)
            });
            const result = await response.json();

            if (response.ok && result.success) {
                mostrarToastAlumno('exito', '✅ Informe clínico subido exitosamente. Tu docente podrá revisarlo en su panel.');
                document.getElementById('buscarValor').value = document.getElementById('telefono').value;
                buscarPaciente();
            } else {
                mostrarToastAlumno('error', '❌ Error al guardar: ' + (result.message || 'Revisa la consola'));
            }
        } catch (error) {
            console.error(error);
            mostrarToastAlumno('error', '❌ No se pudo conectar con el servidor para guardar.');
        } finally {
            btnGuardar.disabled = false;
            btnGuardar.innerHTML = '<i class="bi bi-cloud-arrow-up-fill me-2"></i> Guardar Expediente';
        }
    });
}

function mostrarToastAlumno(tipo, mensaje) {
    const anterior = document.getElementById('toast-alumno');
    if (anterior) anterior.remove();

    const colores = {
        exito: { bg: '#064e3b', border: '#10b981' },
        error: { bg: '#450a0a', border: '#ef4444' }
    };
    const c = colores[tipo] || colores.exito;

    const toast = document.createElement('div');
    toast.id = 'toast-alumno';
    toast.style.cssText = `
        position: fixed; bottom: 28px; right: 28px;
        background: ${c.bg}; border: 1px solid ${c.border};
        border-radius: 12px; padding: 16px 22px;
        color: #fff; font-size: 14px; z-index: 9999;
        max-width: 380px; line-height: 1.5;
        animation: slideUp 0.3s ease;
        font-family: 'Poppins', sans-serif;
    `;
    toast.innerHTML = mensaje;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 7000);
}

// --- MANEJO DE HASH PARA CARGAR FORMULARIO DIRECTAMENTE ---
function verificarHashParaNuevaConsulta() {
    if (window.location.hash === '#nueva') {
        mostrarFormularioNuevoPaciente();
        // Opcional: limpiar el hash después de cargarlo para que si vuelve a dar clic funcione
        // history.replaceState(null, null, ' '); 
    }
}

// Verificar al cargar la página
document.addEventListener('DOMContentLoaded', verificarHashParaNuevaConsulta);

// Verificar si el hash cambia mientras ya está en la página
window.addEventListener('hashchange', verificarHashParaNuevaConsulta);