document.getElementById('registro-alumno-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const nombre = document.getElementById('nombre-alumno').value;
    const matricula = document.getElementById('matricula-alumno').value;
    const unidad_clinica = document.getElementById('unidad-clinica-alumno').value;

    console.log('Registrando alumno:', { nombre, matricula, unidad_clinica });

    // Alerta de confirmación
    alert(`¡Alumno registrado con éxito!\n\nNombre: ${nombre}\nMatricula: ${matricula}\nUnidad Clinica: ${unidad_clinica}`);

    // Limpiar formulario
    this.reset();
});