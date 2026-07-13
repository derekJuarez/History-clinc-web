-- --------------------------------------------------------
-- NUEVO ESQUEMA DE BASE DE DATOS: CLINICA ODONTOLOGICA
-- --------------------------------------------------------

-- Desactivar temporalmente la verificación de llaves foráneas para poder borrar tablas en cualquier orden
SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar tablas viejas si existen
DROP TABLE IF EXISTS `informes_clinicos`;
DROP TABLE IF EXISTS `solicitudes_cambio_asesor`;
DROP TABLE IF EXISTS `consultas_evolucion`;
DROP TABLE IF EXISTS `consulta_evolucion`;
DROP TABLE IF EXISTS `citas`;
DROP TABLE IF EXISTS `historial_clinico`;
DROP TABLE IF EXISTS `clinicas`;
DROP TABLE IF EXISTS `paciente`;
DROP TABLE IF EXISTS `usuarios`;
DROP TABLE IF EXISTS `rol`;
DROP TABLE IF EXISTS `alergias_paciente`;
DROP TABLE IF EXISTS `antecedentes_paciente`;
DROP TABLE IF EXISTS `habitos_paciente`;
DROP TABLE IF EXISTS `solicitud_cambio_asesor`;

-- 1. Tabla ROL
CREATE TABLE `rol` (
  `Id_Rol` int(11) NOT NULL AUTO_INCREMENT,
  `Rol` varchar(50) NOT NULL,
  PRIMARY KEY (`Id_Rol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insertar roles por defecto
INSERT INTO `rol` (`Id_Rol`, `Rol`) VALUES
(1, 'Maestro'),
(2, 'Alumno'),
(3, 'Administrador'),
(4, 'Paciente');

-- 2. Tabla USUARIOS
CREATE TABLE `usuarios` (
  `ID_MATRICULA` varchar(50) NOT NULL,
  `Nombre` varchar(100) NOT NULL,
  `Telefono` varchar(20) DEFAULT NULL,
  `Contrasena` varchar(255) NOT NULL,
  `Correo` varchar(100) NOT NULL,
  `Id_Rol` int(11) NOT NULL,
  `Id_Maestro` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`ID_MATRICULA`),
  KEY `fk_usuarios_rol` (`Id_Rol`),
  CONSTRAINT `fk_usuarios_rol` FOREIGN KEY (`Id_Rol`) REFERENCES `rol` (`Id_Rol`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 3. Tabla PACIENTE
CREATE TABLE `paciente` (
  `Id_Paciente` int(11) NOT NULL AUTO_INCREMENT,
  `Id_Usuario` varchar(50) NOT NULL,
  `FechaNacimiento` date NOT NULL,
  `Sexo` varchar(10) NOT NULL,
  `EstadoCivil` varchar(30) DEFAULT NULL,
  `Ocupacion` varchar(100) DEFAULT NULL,
  `LugarOrigen` varchar(150) DEFAULT NULL,
  `TelefonoEmergencia` varchar(20) DEFAULT NULL,
  `ContactoFamiliar` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`Id_Paciente`),
  KEY `fk_paciente_usuario` (`Id_Usuario`),
  CONSTRAINT `fk_paciente_usuario` FOREIGN KEY (`Id_Usuario`) REFERENCES `usuarios` (`ID_MATRICULA`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 4. Tabla CLINICAS
CREATE TABLE `clinicas` (
  `ID_CLINICA` int(11) NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(255) NOT NULL,
  `Encargado` varchar(255) NOT NULL,
  `Ubicacion` varchar(255) NOT NULL,
  `Estado` varchar(50) DEFAULT 'PENDIENTE',
  PRIMARY KEY (`ID_CLINICA`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 5. Tabla CITAS
CREATE TABLE `citas` (
  `Id_Cita` int(11) NOT NULL AUTO_INCREMENT,
  `Id_Paciente` int(11) NOT NULL,
  `Id_Clinica` int(11) NOT NULL,
  `Id_Estudiante` varchar(50) NOT NULL,
  `Id_Docente_Asesor` varchar(50) NOT NULL,
  `Fecha` date NOT NULL,
  `Hora` time NOT NULL,
  `Estado` varchar(50) DEFAULT 'Pendiente',
  PRIMARY KEY (`Id_Cita`),
  KEY `fk_citas_paciente` (`Id_Paciente`),
  KEY `fk_citas_clinica` (`Id_Clinica`),
  KEY `fk_citas_estudiante` (`Id_Estudiante`),
  KEY `fk_citas_docente` (`Id_Docente_Asesor`),
  CONSTRAINT `fk_citas_paciente` FOREIGN KEY (`Id_Paciente`) REFERENCES `paciente` (`Id_Paciente`) ON DELETE CASCADE,
  CONSTRAINT `fk_citas_clinica` FOREIGN KEY (`Id_Clinica`) REFERENCES `clinicas` (`ID_CLINICA`) ON DELETE CASCADE,
  CONSTRAINT `fk_citas_estudiante` FOREIGN KEY (`Id_Estudiante`) REFERENCES `usuarios` (`ID_MATRICULA`) ON DELETE CASCADE,
  CONSTRAINT `fk_citas_docente` FOREIGN KEY (`Id_Docente_Asesor`) REFERENCES `usuarios` (`ID_MATRICULA`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 6. Tabla CONSULTA_EVOLUCION
CREATE TABLE `consulta_evolucion` (
  `Id_Consulta` int(11) NOT NULL AUTO_INCREMENT,
  `Id_Cita` int(11) NOT NULL,
  `MotivoConsulta` text DEFAULT NULL,
  `FarmacologiaActual` text DEFAULT NULL,
  `ATM` text DEFAULT NULL,
  `TejidosBlandos` text DEFAULT NULL,
  `Periodonto` text DEFAULT NULL,
  `HigieneOral` varchar(50) DEFAULT NULL,
  `Odontograma` text DEFAULT NULL,
  `Diagnostico` text DEFAULT NULL,
  `PlanTratamiento` text DEFAULT NULL,
  PRIMARY KEY (`Id_Consulta`),
  KEY `fk_consulta_cita` (`Id_Cita`),
  CONSTRAINT `fk_consulta_cita` FOREIGN KEY (`Id_Cita`) REFERENCES `citas` (`Id_Cita`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 7. Tabla INFORMES_CLINICOS
CREATE TABLE `informes_clinicos` (
  `Id_Informe` int(11) NOT NULL AUTO_INCREMENT,
  `Id_Consulta` int(11) NOT NULL,
  `FechaRegistro` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Estado` varchar(50) DEFAULT 'PENDIENTE',
  `OdontogramaJSON` longtext DEFAULT NULL,
  PRIMARY KEY (`Id_Informe`),
  KEY `fk_informe_consulta` (`Id_Consulta`),
  CONSTRAINT `fk_informe_consulta` FOREIGN KEY (`Id_Consulta`) REFERENCES `consulta_evolucion` (`Id_Consulta`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 8. Tabla HISTORIAL_CLINICO
CREATE TABLE `historial_clinico` (
  `Id_Historial` int(11) NOT NULL AUTO_INCREMENT,
  `Id_Paciente` int(11) NOT NULL,
  `MedicoCabecera` varchar(255) DEFAULT NULL,
  `HigieneOralBase` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`Id_Historial`),
  KEY `fk_historial_paciente` (`Id_Paciente`),
  CONSTRAINT `fk_historial_paciente` FOREIGN KEY (`Id_Paciente`) REFERENCES `paciente` (`Id_Paciente`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 9. Tabla ALERGIAS_PACIENTE
CREATE TABLE `alergias_paciente` (
  `Id_Alergia` int(11) NOT NULL AUTO_INCREMENT,
  `Id_Paciente` int(11) NOT NULL,
  `Alergia` varchar(255) NOT NULL,
  `Observacion` text DEFAULT NULL,
  PRIMARY KEY (`Id_Alergia`),
  KEY `fk_alergias_paciente` (`Id_Paciente`),
  CONSTRAINT `fk_alergias_paciente` FOREIGN KEY (`Id_Paciente`) REFERENCES `paciente` (`Id_Paciente`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 10. Tabla ANTECEDENTES_PACIENTE
CREATE TABLE `antecedentes_paciente` (
  `Id_Antecedente` int(11) NOT NULL AUTO_INCREMENT,
  `Id_Paciente` int(11) NOT NULL,
  `Categoria` varchar(100) NOT NULL,
  `Detalle` text NOT NULL,
  PRIMARY KEY (`Id_Antecedente`),
  KEY `fk_antecedentes_paciente` (`Id_Paciente`),
  CONSTRAINT `fk_antecedentes_paciente` FOREIGN KEY (`Id_Paciente`) REFERENCES `paciente` (`Id_Paciente`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 11. Tabla HABITOS_PACIENTE
CREATE TABLE `habitos_paciente` (
  `Id_Habito` int(11) NOT NULL AUTO_INCREMENT,
  `Id_Paciente` int(11) NOT NULL,
  `Habito` varchar(100) NOT NULL,
  `Frecuencia` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`Id_Habito`),
  KEY `fk_habitos_paciente` (`Id_Paciente`),
  CONSTRAINT `fk_habitos_paciente` FOREIGN KEY (`Id_Paciente`) REFERENCES `paciente` (`Id_Paciente`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 12. Tabla SOLICITUD_CAMBIO_ASESOR
CREATE TABLE `solicitud_cambio_asesor` (
  `Id_Solicitud` int(11) NOT NULL AUTO_INCREMENT,
  `MatriculaAlumno` varchar(50) NOT NULL,
  `NombreAlumno` varchar(100) NOT NULL,
  `MatriculaMaestroNuevo` varchar(50) NOT NULL,
  `NombreMaestroNuevo` varchar(100) NOT NULL,
  `MatriculaMaestroActual` varchar(50) NOT NULL,
  `NombreMaestroActual` varchar(100) NOT NULL,
  `Estado` varchar(50) DEFAULT 'PENDIENTE',
  `FechaSolicitud` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id_Solicitud`),
  KEY `fk_solicitud_alumno` (`MatriculaAlumno`),
  KEY `fk_solicitud_maestro_nuevo` (`MatriculaMaestroNuevo`),
  KEY `fk_solicitud_maestro_actual` (`MatriculaMaestroActual`),
  CONSTRAINT `fk_solicitud_alumno` FOREIGN KEY (`MatriculaAlumno`) REFERENCES `usuarios` (`ID_MATRICULA`) ON DELETE CASCADE,
  CONSTRAINT `fk_solicitud_maestro_nuevo` FOREIGN KEY (`MatriculaMaestroNuevo`) REFERENCES `usuarios` (`ID_MATRICULA`) ON DELETE CASCADE,
  CONSTRAINT `fk_solicitud_maestro_actual` FOREIGN KEY (`MatriculaMaestroActual`) REFERENCES `usuarios` (`ID_MATRICULA`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Restaurar verificación de llaves foráneas
SET FOREIGN_KEY_CHECKS = 1;
