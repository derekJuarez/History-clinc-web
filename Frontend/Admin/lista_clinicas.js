document.addEventListener('DOMContentLoaded', async () => {
    const listaNombres = document.getElementById('lista-nombres-clinicas');
    const listaEncargados = document.getElementById('lista-encargados-clinicas');
    const listaUbicaciones = document.getElementById('lista-ubicacion-clinicas');

    try {
        const response = await fetch('/api/clinicas');
        const result = await response.json();

        if (response.ok && result.success) {
            listaNombres.innerHTML = '';
            listaEncargados.innerHTML = '';
            listaUbicaciones.innerHTML = '';

            if (result.data.length === 0) {
                listaNombres.innerHTML = '<div class="conteo-body-box-item">No hay clínicas registradas</div>';
                listaEncargados.innerHTML = '<div class="conteo-body-box-item">-</div>';
                listaUbicaciones.innerHTML = '<div class="conteo-body-box-item">-</div>';
                return;
            }

            result.data.forEach(clinica => {
                listaNombres.innerHTML += `<div class="conteo-body-box-item">${clinica.NOMBRE_CLINICA}</div>`;
                listaEncargados.innerHTML += `<div class="conteo-body-box-item">${clinica.ENCARGADO}</div>`;
                listaUbicaciones.innerHTML += `<div class="conteo-body-box-item">${clinica.UBICACION}</div>`;
            });
        } else {
            console.error('Error al obtener clínicas:', result.message);
        }
    } catch (error) {
        console.error('Error al conectar con el backend:', error);
    }
});
