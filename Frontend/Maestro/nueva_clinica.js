document.getElementById('registro-clinica-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const nombre = document.getElementById('nombre-clinica').value;
    const encargado = document.getElementById('encargado-clinica').value;
    const ubicacion = document.getElementById('ubicacion-clinica').value;

    console.log('Registrando clínica:', { nombre, encargado, ubicacion });

    // Alerta de confirmación
    alert(`¡Clínica registrada con éxito!\n\nNombre: ${nombre}\nEncargado: ${encargado}\nUbicación: ${ubicacion}`);
    
    // Limpiar formulario
    this.reset();
});
