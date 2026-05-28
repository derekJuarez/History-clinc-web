const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'clinica_odontologica'
});

connection.connect((err) => {
    if (err) {
        console.error('Error MySQL:', err);
        return;
    }
    console.log('Conectado a MySQL');
});

module.exports = connection;