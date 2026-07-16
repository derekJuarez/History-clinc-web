import mysql from 'mysql2/promise';

const MATRICULA_ALUMNO = '2223668m'; // Manto - alumno real en la BD

const db = await mysql.createConnection({host:'localhost',user:'root',password:'',database:'clinica_odontologica'});

const connection = db; // use connection directly
try {
    await connection.beginTransaction();
    
    // 1. Usuario fantasma
    const pseudoMatricula = `PAC-TEST-${Date.now()}`;
    await connection.query(
        'INSERT INTO usuarios (ID_MATRICULA, Nombre, Telefono, Contrasena, Correo, Id_Rol) VALUES (?, ?, ?, ?, ?, 4)',
        [pseudoMatricula, 'Test Paciente', '4432169087', 'paciente123', `${pseudoMatricula}@test.local`]
    );
    console.log('OK 1. Usuario creado:', pseudoMatricula);
    
    // 2. Paciente
    const [resPac] = await connection.query(
        'INSERT INTO paciente (Id_Usuario, FechaNacimiento, Sexo, Ocupacion, TelefonoEmergencia, Id_Estudiante_Registro) VALUES (?, ?, ?, ?, ?, ?)',
        [pseudoMatricula, '2000-05-15', 'M', 'Estudiante', '4432169087', MATRICULA_ALUMNO]
    );
    const idPac = resPac.insertId;
    console.log('OK 2. Paciente creado, id:', idPac);
    
    // 3. Historial clinico
    await connection.query(
        'INSERT INTO historial_clinico (Id_Paciente, MedicoCabecera, HigieneOralBase) VALUES (?, ?, ?)',
        [idPac, 'Dr. Test', 'Buena']
    );
    console.log('OK 3. Historial clinico creado');
    
    // 4. Antecedente
    await connection.query(
        'INSERT INTO antecedentes_paciente (Id_Paciente, Categoria, Detalle) VALUES (?, ?, ?)',
        [idPac, 'Medicamentos', 'Paracetamol']
    );
    console.log('OK 4. Antecedente guardado');
    
    // 5. Cita
    const [resCita] = await connection.query(
        "INSERT INTO citas (Id_Paciente, Id_Clinica, Id_Estudiante, Id_Docente_Asesor, Fecha, Hora, Estado, Motivo) VALUES (?, 1, ?, ?, CURDATE(), CURTIME(), 'Completa', ?)",
        [idPac, MATRICULA_ALUMNO, MATRICULA_ALUMNO, 'Caries clase II']
    );
    const idCita = resCita.insertId;
    console.log('OK 5. Cita creada, id:', idCita);
    
    // 6. Consulta evolucion
    const [resCons] = await connection.query(
        'INSERT INTO consulta_evolucion (Id_Cita, MotivoConsulta, ATM, HigieneOral, Odontograma, Diagnostico, PlanTratamiento) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [idCita, 'Caries clase II', 'Normal', 'Buena', '{}', 'Caries clase II', 'Obturacion resina']
    );
    const idCons = resCons.insertId;
    console.log('OK 6. Consulta creada, id:', idCons);
    
    // 7. Informe clinico
    const [resInf] = await connection.query(
        'INSERT INTO informes_clinicos (Id_Consulta, OdontogramaJSON) VALUES (?, ?)',
        [idCons, '{}']
    );
    console.log('OK 7. Informe clinico creado, id:', resInf.insertId);
    
    await connection.rollback();
    console.log('\nPRUEBA COMPLETA: Todos los INSERTs funcionan correctamente.');
    console.log('(Transaccion revertida - no se guardaron datos de prueba)');
    
} catch(e) {
    await connection.rollback();
    console.error('ERROR:', e.message);
    if (e.sql) console.error('SQL:', e.sql);
} finally {
    await db.end();
}
