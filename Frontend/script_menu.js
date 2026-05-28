const menuAlumnoHTML = `
<aside class="sidebar" id="sidebar">
    <div class="sidebar-header">
        <div class="icon">
            <i class="ri-user-fill"></i>
        </div>
        <div class="title-text">
            <h2>Bienvenido</h2>
            <span>Panel de control</span>
        </div>
    </div>

    <div class="menu-label">Menú Principal</div>

    <nav class="sidebar-menu">
        <ul>
            <li>
                <a href="dashboard.html" class="active">
                    <i class="ri-layout-grid-fill"></i>
                    Panel Principal
                </a>
            </li>
            <li>
                <a href="#">
                    <i class="ri-bar-chart-fill"></i>
                    Historial clinico
                </a>
            </li>
            <li class="has-submenu">
                <a href="#" class="submenu-toggle">
                    <i class="ri-group-fill"></i>
                    Paciente
                    <i class="ri-arrow-down-s-line dropdown-icon" style="margin-left: auto; margin-right: 0; font-size: 18px;"></i>
                </a>
                <ul class="submenu">
                    <li><a href="Registro_Paciente.html">Registrar Paciente</a></li>
                    <li><a href="Ver_Pacientes.html">Ver Pacientes</a></li>
                </ul>
            </li>
            <li>
                <a href="citas.html">
                    <i class="ri-shopping-cart-fill"></i>
                    Citas
                </a>
            </li>
            <li>
                <a href="#">
                    <i class="ri-file-list-3-fill"></i>
                    Reportes
                </a>
            </li>
        </ul>
    </nav>

    <div class="sidebar-footer">
        <a href="#">
            <i class="ri-settings-3-fill"></i>
            Configuración
        </a>
    </div>
</aside>
`;

const menuMaestroHTML = `
<aside class="sidebar" id="sidebar">
    <div class="sidebar-header">
        <div class="icon">
            <i class="ri-user-fill"></i>
        </div>
        <div class="title-text">
            <h2>Bienvenido</h2>
            <span>Panel de control</span>
        </div>
    </div>

    <div class="menu-label">Menú Principal</div>

    <nav class="sidebar-menu">
        <ul>
            <li>
                <a href="#" class="active">
                    <i class="ri-bar-chart-box-fill"></i>
                    Conteo de pacientes
                </a>
            </li>
            <li>
                <a href="#">
                    <i class="ri-user-add-fill"></i>
                    Agregar alumno
                </a>
            </li>
            <li>
                <a href="#">
                    <i class="ri-list-check-2"></i>
                    Lista de alumnos
                </a>
            </li>
            <li>
                <a href="#">
                    <i class="ri-add-circle-fill"></i>
                    Nueva sección
                </a>
            </li>
            <li>
                <a href="#">
                    <i class="ri-layout-grid-fill"></i>
                    Ver secciones
                </a>
            </li>
            <li>
                <a href="#">
                    <i class="ri-file-add-fill"></i>
                    Nueva historia
                </a>
            </li>
            <li>
                <a href="#">
                    <i class="ri-file-list-3-fill"></i>
                    Ver historias
                </a>
            </li>
        </ul>
    </nav>

    <div class="sidebar-footer">
        <a href="#">
            <i class="ri-settings-3-fill"></i>
            Configuración
        </a>
    </div>
</aside>
`;

document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('sidebar-container');
    
    if (container) {
        // Obtenemos qué menú cargar según el atributo data-menu
        const menuType = container.getAttribute('data-menu');
        
        // Inyectamos el HTML correspondiente directamente (sin usar fetch)
        if (menuType === 'alumno') {
            container.outerHTML = menuAlumnoHTML;
        } else if (menuType === 'maestro') {
            container.outerHTML = menuMaestroHTML;
        }

        // Buscamos el nuevo sidebar en el DOM
        const newSidebar = document.getElementById('sidebar');
        
        if (newSidebar) {
            // Lógica para el submenú del alumno
            if (menuType === 'alumno') {
                const submenuToggles = newSidebar.querySelectorAll('.submenu-toggle');
                submenuToggles.forEach(toggle => {
                    toggle.addEventListener('click', function(e) {
                        e.preventDefault();
                        const parentLi = this.parentElement;
                        parentLi.classList.toggle('active');
                    });
                });
            }

            // Resaltar la página actual automáticamente
            const currentUrl = window.location.pathname.split('/').pop();
            const links = newSidebar.querySelectorAll('a');
            
            links.forEach(link => {
                link.classList.remove('active');
                
                const href = link.getAttribute('href');
                if (href === currentUrl || (currentUrl === '' && href === 'dashboard.html')) {
                    link.classList.add('active');
                    // Abrir submenú padre si es necesario
                    const parentSubmenu = link.closest('.submenu');
                    if (parentSubmenu) {
                        parentSubmenu.parentElement.classList.add('active');
                    }
                }
            });
        }
    }
});
