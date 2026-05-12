function toggleMenu() {
    // Seleccionamos el elemento del menú lateral
    const sidebar = document.getElementById("sidebar");
    
    // Alternamos la clase "active" (si no la tiene se la pone, si la tiene se la quita)
    sidebar.classList.toggle("active");
}
