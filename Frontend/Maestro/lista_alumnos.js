document.addEventListener('DOMContentLoaded', async () => {
    const listaNombres = document.getElementById('lista-nombres');
    const listaMatriculas = document.getElementById('lista-matriculas');
    const listaClinicas = document.getElementById('lista-clinicas');
    const teacherMatricula = localStorage.getItem('matricula');

    if (!teacherMatricula) {
        console.error('No se encontró la matrícula del maestro en localStorage');
        return;
    }

    try {
        const response = await fetch(`/api/alumnos/maestro/${teacherMatricula}`);
        const result = await response.json();

        if (response.ok && result.success) {
            listaNombres.innerHTML = '';
            listaMatriculas.innerHTML = '';
            listaClinicas.innerHTML = '';

            if (result.data.length === 0) {
                listaNombres.innerHTML = '<div class="conteo-body-box-item">No tienes alumnos asignados</div>';
                listaMatriculas.innerHTML = '<div class="conteo-body-box-item">-</div>';
                listaClinicas.innerHTML = '<div class="conteo-body-box-item">-</div>';
                return;
            }

            result.data.forEach(alumno => {
                listaNombres.innerHTML += `<div class="conteo-body-box-item">${alumno.nombre}</div>`;
                listaMatriculas.innerHTML += `<div class="conteo-body-box-item">${alumno.matricula}</div>`;
                listaClinicas.innerHTML += `<div class="conteo-body-box-item">${alumno.clinica || 'Sin clínica registrada'}</div>`;
            });
        } else {
            console.error('Error al obtener alumnos:', result.message);
        }
    } catch (error) {
        console.error('Error al conectar con el backend:', error);
    }
});
