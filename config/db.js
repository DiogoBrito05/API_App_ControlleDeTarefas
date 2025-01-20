const os = require('os');
const mysql = require("mysql2");

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "1608",
    database: "controle_tarefas_pessoal",
    port: 3306, 
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

module.exports = pool;

// // Palavra Secreta usada para Gerar Token no JWT
// exports.secret = "17e3355f0df17d90d7d601f2f7d25b13";