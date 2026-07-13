document.addEventListener("DOMContentLoaded", async () => {
    let id_paciente = localStorage.getItem("id_paciente");
    
    if (!id_paciente) {
        id_paciente = 1;
    }
    
    const token = localStorage.getItem("token");
    
    // Variables globales para la vista
    let todasLasCitas = [];
    let filtroActual = 'proximas'; // 'proximas' o 'historial'
    
    try{
        const response = await fetch(`/api/citas/obtener/${id_paciente}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const result = await response.json();

        if (result.success) {
            todasLasCitas = result.data;
            
            if (todasLasCitas.length > 0 && todasLasCitas[0].Nombre_Paciente) {
                document.getElementById('paciente-nombre').textContent = todasLasCitas[0].Nombre_Paciente;
            }
            
            actualizarPerfilYContadores(todasLasCitas);
            
            // Configurar botones de los Tabs
            document.getElementById('tab-proximas').addEventListener('click', () => cambiarTab('proximas'));
            document.getElementById('tab-historial').addEventListener('click', () => cambiarTab('historial'));
            
            // Renderizar la lista inicial (Próximas)
            renderizarListaDeCitas();

        } else {
            console.error('Error al obtener citas:', result.message);
        }
    } catch (error) {
        console.error('Error al obtener citas:', error);
    }

    // --- FUNCIONES DE RENDERIZADO ---

    function cambiarTab(nuevoTab) {
        filtroActual = nuevoTab;
        
        if (nuevoTab === 'proximas') {
            document.getElementById('tab-proximas').classList.add('active');
            document.getElementById('tab-historial').classList.remove('active');
        } else {
            document.getElementById('tab-historial').classList.add('active');
            document.getElementById('tab-proximas').classList.remove('active');
        }
        
        renderizarListaDeCitas();
    }

    function actualizarPerfilYContadores(citas) {
        const hoy = new Date();
        const mesActual = hoy.getMonth();
        const añoActual = hoy.getFullYear();
        
        let proximas = 0;
        let enEsteMes = 0;
        let completadas = 0;

        citas.forEach(cita => {
            const fechaCita = new Date(cita.Fecha);
            fechaCita.setMinutes(fechaCita.getMinutes() + fechaCita.getTimezoneOffset()); 

            const estatus = cita.Estado.toLowerCase();

            if ((estatus === 'confirmada' || estatus === 'pendiente') && fechaCita >= hoy) proximas++;
            if (estatus === 'completada' || estatus === 'cancelada') completadas++;
            if (fechaCita.getMonth() === mesActual && fechaCita.getFullYear() === añoActual) enEsteMes++;
        });

        document.getElementById('count-proximas').textContent = proximas;
        document.getElementById('count-total').textContent = citas.length; // Total de citas
        document.getElementById('count-mes').textContent = enEsteMes;
        document.getElementById('resumen-general-citas').textContent = `${proximas} próxima(s) · ${completadas} en historial`;
        
        const nombresMeses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        document.getElementById('nombre-mes-actual').textContent = `en ${nombresMeses[mesActual]}`;
    }

    function renderizarListaDeCitas() {
        const contenedor = document.getElementById('contenedor-lista-citas');
        contenedor.innerHTML = ''; 

        // Filtrar citas según el tab activo
        const citasFiltradas = todasLasCitas.filter(cita => {
            const estatus = cita.Estado.toLowerCase();
            if (filtroActual === 'proximas') {
                return estatus === 'pendiente' || estatus === 'confirmada';
            } else {
                return estatus === 'completada' || estatus === 'cancelada';
            }
        });

        if (citasFiltradas.length === 0) {
            contenedor.innerHTML = `<p style="padding: 20px; color: #fff; text-align: center;">No hay citas en esta sección.</p>`;
            document.getElementById('detalle-cita-panel').style.display = 'none';
            return;
        }

        citasFiltradas.forEach((cita, index) => {
            const fechas = formatearFechaHora(cita.Fecha, cita.Hora);
            const estilo = obtenerEstiloEstado(cita.Estado);
            
            const nombreEstudiante = cita.Nombre_Estudiante ? `Est. ${cita.Nombre_Estudiante}` : "Estudiante no asignado";
            const nombreProfesor = cita.Nombre_Docente ? `Prof. ${cita.Nombre_Docente} (Resp.)` : "Profesor no asignado";

            const card = document.createElement('div');
            card.className = `appointment-card ${index === 0 ? 'active' : ''}`;
            
            card.innerHTML = `
                <div class="date-box">
                    <span class="month">${fechas.mesCorto}</span>
                    <span class="day">${fechas.diaNumero}</span>
                    <span class="weekday">${fechas.diaCorto}</span>
                </div>
                <div class="info-box">
                    <h4 class="student-name">${nombreEstudiante}</h4>
                    <span class="prof-name">${nombreProfesor}</span>
                    <div class="meta">
                        <span class="time"><i class="ri-time-line"></i> ${fechas.horaFormateada}</span>
                        <span class="type"><i class="ri-map-pin-line"></i> Presencial</span>
                    </div>
                </div>
                <div class="status-box">
                    <span class="status ${estilo.clase}"><i class="${estilo.icono}"></i> ${estilo.texto}</span>
                    <i class="ri-arrow-right-s-line arrow"></i>
                </div>
            `;

            card.addEventListener('click', () => {
                document.querySelectorAll('.appointment-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                mostrarDetalles(cita);
            });

            contenedor.appendChild(card);
        });

        // Mostrar detalles de la primera de la lista filtrada
        mostrarDetalles(citasFiltradas[0]);
    }

    function mostrarDetalles(cita) {
        document.getElementById('detalle-cita-panel').style.display = 'block';
        
        const fechas = formatearFechaHora(cita.Fecha, cita.Hora);
        const estilo = obtenerEstiloEstado(cita.Estado);
        
        const nombreEstudiante = cita.Nombre_Estudiante || "No asignado";
        const nombreProfesor = cita.Nombre_Docente ? `Supervisión: Prof. ${cita.Nombre_Docente}` : "Sin profesor asignado";
        
        let iniciales = "NN";
        if(cita.Nombre_Estudiante) {
            const partes = cita.Nombre_Estudiante.split(" ");
            iniciales = (partes[0][0] + (partes[1] ? partes[1][0] : '')).toUpperCase();
        }

        document.getElementById('detalle-iniciales').textContent = iniciales;
        document.getElementById('detalle-estudiante').textContent = `Est. ${nombreEstudiante}`;
        document.getElementById('detalle-profesor').textContent = nombreProfesor;
        
        document.getElementById('detalle-fecha').textContent = fechas.fechaLarga;
        document.getElementById('detalle-hora').textContent = `${fechas.horaFormateada} hs`;
        
        document.getElementById('detalle-estado').className = `status ${estilo.clase}`;
        document.getElementById('detalle-estado').innerHTML = `<i class="${estilo.icono}"></i> ${estilo.texto}`;
        
        const nombreClinica = cita.Nombre_Clinica || "Clínica General";
        const ubicacion = cita.Ubicacion_Clinica || "Ubicación por definir";
        document.getElementById('detalle-ubicacion').textContent = `${nombreClinica}, ${ubicacion}`;
        
        // Cargar teléfonos (obtenidos gracias al nuevo SQL)
        document.getElementById('detalle-tel-estudiante').textContent = cita.Telefono_Estudiante || "No disponible";
        document.getElementById('detalle-tel-profesor').textContent = cita.Telefono_Docente || "No disponible";
        
        document.getElementById('detalle-notas').textContent = cita.Nota || "Sin notas adicionales registradas para esta cita.";
    }

    // --- UTILIDADES ---

    function formatearFechaHora(fechaSQL, horaSQL) {
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        
        const fecha = new Date(fechaSQL);
        fecha.setMinutes(fecha.getMinutes() + fecha.getTimezoneOffset());
        
        return {
            mesCorto: meses[fecha.getMonth()].substring(0, 3),
            diaNumero: fecha.getDate().toString().padStart(2, '0'),
            diaCorto: dias[fecha.getDay()].substring(0, 3),
            fechaLarga: `${dias[fecha.getDay()]}, ${fecha.getDate()} De ${meses[fecha.getMonth()]}`,
            horaFormateada: horaSQL ? horaSQL.substring(0, 5) : "--:--"
        };
    }

    function obtenerEstiloEstado(estado) {
        if (!estado) return { clase: 'badge-completed', icono: 'ri-time-line', texto: 'Indefinido' };
        
        const est = estado.toLowerCase();
        if (est === 'confirmada') return { clase: 'badge-confirmed', icono: 'ri-check-line', texto: 'Confirmada' };
        if (est === 'completada') return { clase: 'badge-completed', icono: 'ri-check-double-line', texto: 'Completada' };
        if (est === 'cancelada') return { clase: 'badge-cancelled', icono: 'ri-close-line', texto: 'Cancelada' };
        if (est === 'pendiente') return { clase: 'badge-completed', icono: 'ri-time-line', texto: 'Pendiente' };
        
        return { clase: 'badge-completed', icono: 'ri-time-line', texto: estado }; 
    }
});
