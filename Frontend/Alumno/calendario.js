document.addEventListener("DOMContentLoaded", () => {
    const calendarDays = document.getElementById("calendar-days");
    const monthYearText = document.getElementById("month-year");
    const prevMonthBtn = document.getElementById("prev-month");
    const nextMonthBtn = document.getElementById("next-month");
    
    // Elementos del Modal
    const modalEditar = document.getElementById("modal-editar-cita");
    const cerrarModalBtn = document.getElementById("cerrar-modal");
    const formEditar = document.getElementById("FormEditarCita");

    let currentDate = new Date(); 
    let citasGlobal = []; // Guardará las citas de la base de datos

    // 1. Obtener citas del backend
    const obtenerCitas = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/citas/obtener', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            citasGlobal = data.data || [];
            renderCalendar();
        } catch (error) {
            console.error('Error al obtener citas:', error);
        }
    };

    const renderCalendar = () => {
        calendarDays.innerHTML = "";
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const monthNames = [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ];

        monthYearText.textContent = `${monthNames[month]} ${year}`;

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        for (let i = firstDayOfMonth; i > 0; i--) {
            const dayDiv = document.createElement("div");
            dayDiv.classList.add("day", "inactive");
            dayDiv.textContent = daysInPrevMonth - i + 1;
            calendarDays.appendChild(dayDiv);
        }

        const today = new Date();
        for (let i = 1; i <= daysInMonth; i++) {
            const dayDiv = document.createElement("div");
            dayDiv.classList.add("day");
            dayDiv.innerHTML = `<span style="position: absolute; top: 5px; width: 100%; text-align: center;">${i}</span>`;

            if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                dayDiv.classList.add("today");
            }

            // MAGIA: Buscar citas para este día exacto
            const diaString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const citasDelDia = citasGlobal.filter(cita => cita.Fecha && cita.Fecha.startsWith(diaString));

            citasDelDia.forEach(cita => {
                const citaElement = document.createElement('div');
                // Estilos dinámicos según el estado de la cita
                citaElement.style.background = cita.Estatus === 'Pendiente' ? '#ffc107' : (cita.Estatus === 'Completa' ? '#28a745' : '#dc3545');
                citaElement.style.color = cita.Estatus === 'Pendiente' ? 'black' : 'white';
                citaElement.style.padding = '4px';
                citaElement.style.marginTop = '5px';
                citaElement.style.borderRadius = '5px';
                citaElement.style.fontSize = '12px';
                citaElement.style.cursor = 'pointer';
                citaElement.textContent = `${cita.Hora.substring(0,5)} - ${cita.Nombre_Paciente || 'Paciente'}`;

                // Al hacer clic en la cita, abrimos el modal
                citaElement.addEventListener('click', () => {
                    abrirModalEditar(cita);
                });

                dayDiv.appendChild(citaElement);
            });

            calendarDays.appendChild(dayDiv);
        }

        const totalDaysRendered = firstDayOfMonth + daysInMonth;
        const nextMonthDays = 42 - totalDaysRendered;

        for (let i = 1; i <= nextMonthDays; i++) {
            const dayDiv = document.createElement("div");
            dayDiv.classList.add("day", "inactive");
            dayDiv.textContent = i;
            calendarDays.appendChild(dayDiv);
        }
    };

    // Elementos internos del Modal
    const vistaTabla = document.getElementById("vista-tabla-cita");
    const tdPaciente = document.getElementById("td-paciente");
    const tdFecha = document.getElementById("td-fecha");
    const tdHora = document.getElementById("td-hora");
    
    const btnModificar = document.getElementById("btn-modificar");
    const btnCompletar = document.getElementById("btn-completar");
    const btnCancelar = document.getElementById("btn-cancelar");
    const btnVolverTabla = document.getElementById("btn-volver-tabla");

    // 2. Función para abrir modal y rellenar la tabla
    const abrirModalEditar = (cita) => {
        // Llenar tabla
        tdPaciente.textContent = cita.Nombre_Paciente || 'Paciente';
        tdFecha.textContent = cita.Fecha.split('T')[0];
        tdHora.textContent = cita.Hora.substring(0,5);
        
        // Guardar datos ocultos para cuando editen
        document.getElementById("edit-id-cita").value = cita.ID_Cita;
        document.getElementById("edit-fecha").value = cita.Fecha.split('T')[0];
        document.getElementById("edit-hora").value = cita.Hora;
        document.getElementById("edit-estatus").value = cita.Estatus;

        // Mostrar tabla y ocultar form
        vistaTabla.style.display = "block";
        formEditar.style.display = "none";
        
        modalEditar.style.display = "flex";
    };

    // 3. Cerrar modal con la crucecita
    cerrarModalBtn.addEventListener('click', () => {
        modalEditar.style.display = "none";
    });

    // Acción: Mostrar Formulario de Modificar Fecha/Hora
    btnModificar.addEventListener('click', () => {
        vistaTabla.style.display = "none";
        formEditar.style.display = "block";
    });

    // Acción: Volver a la tabla
    btnVolverTabla.addEventListener('click', () => {
        formEditar.style.display = "none";
        vistaTabla.style.display = "block";
    });

    // Función auxiliar para actualizar rápido el estatus (Completar / Cancelar)
    const cambiarEstatusCita = async (nuevoEstatus) => {
        const id_cita = document.getElementById("edit-id-cita").value;
        const datosCita = {
            fecha: document.getElementById("edit-fecha").value,
            hora: document.getElementById("edit-hora").value,
            estatus: nuevoEstatus
        };

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/citas/modificar/${id_cita}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(datosCita)
            });
            if(res.ok) {
                alert(`¡Cita marcada como ${nuevoEstatus}!`);
                modalEditar.style.display = "none";
                obtenerCitas();
            } else {
                alert('Error al cambiar el estatus');
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Acción: Completar Cita
    btnCompletar.addEventListener('click', () => {
        if(confirm("¿Estás seguro de marcar esta cita como COMPLETA?")) {
            cambiarEstatusCita("Completa");
        }
    });

    // Acción: Cancelar Cita
    btnCancelar.addEventListener('click', () => {
        if(confirm("¿Estás seguro de CANCELAR esta cita?")) {
            cambiarEstatusCita("Cancelada");
        }
    });

    // 4. Guardar cambios (Reprogramar Fecha/Hora)
    formEditar.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id_cita = document.getElementById("edit-id-cita").value;
        const nuevosDatos = {
            fecha: document.getElementById("edit-fecha").value,
            hora: document.getElementById("edit-hora").value,
            estatus: document.getElementById("edit-estatus").value // Mantiene su estatus actual
        };

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/citas/modificar/${id_cita}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(nuevosDatos)
            });
            
            if(res.ok) {
                alert('¡Fecha y Hora reprogramadas exitosamente!');
                modalEditar.style.display = "none";
                obtenerCitas();
            } else {
                alert('Error al reprogramar');
            }
        } catch (error) {
            console.error(error);
        }
    });

    prevMonthBtn.addEventListener("click", () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener("click", () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    // Arrancamos la aplicación trayendo las citas
    obtenerCitas();
});

