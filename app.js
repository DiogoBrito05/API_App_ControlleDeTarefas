const express = require("express");
const bodyParser = require("body-parser");
const os = require("os");
const db = require("./config/db");
const log = require("./config/log");
const userRoutes = require("./Controllers/user_controller");
const taskController = require('./Controllers/task_controller.js');
const cors = require("cors");

const app = express();
const PORT = 3000;


const corsOptions = {
    origin: 'http://localhost:3050',  // URL do seu frontend Flutter
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };

// Configuração do CORS
app.use(cors(corsOptions));

// Middleware
app.use(bodyParser.json());

// Testar conexão com o banco
db.getConnection((err, connection) => {
    if (err) {
        console.error("Erro ao conectar ao banco de dados:", err.message);
        log.gravalog(`Erro ao conectar ao banco: ${err.message}`);
        process.exit(1);
    }
    console.log("Conexão com o banco de dados estabelecida!");
    connection.release();
});

// Rotas
app.use("/user_controller", userRoutes);
app.use("/task_controller", taskController);

// Iniciar o servidor
app.listen(PORT, () => {
    const date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    console.log(`=============================================`);
    console.log(`Servidor: ${os.hostname}`);
    console.log(`SO: ${os.type}`);
    console.log(`Iniciado em: ${date}`);
    console.log(`Api-ControleDeTarefas rodando na porta ${PORT}`);
    console.log(`=============================================`);
    log.gravalog(`Servidor iniciado em ${date}`);
});
