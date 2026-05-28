import mysql from 'mysql2/promise';

const connection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'clinica_odontologia',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Probar la conexión
try {
    await connection.query('SELECT 1 + 1 AS solution');
    console.log('Conectado a MySQL exitosamente');
} catch (error) {
    console.error('Error conectando a MySQL:', error);
}

export default connection;
