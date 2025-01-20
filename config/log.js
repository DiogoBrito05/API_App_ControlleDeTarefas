const fs = require("fs");
const path = require("path");

exports.gravalog = function (texto) {
    const day = ("0" + new Date().getDate()).slice(-2);
    const month = ("0" + (new Date().getMonth() + 1)).slice(-2);
    const year = new Date().getFullYear();
    const hours = ("0" + new Date().getHours()).slice(-2);
    const minutes = ("0" + new Date().getMinutes()).slice(-2);
    const seconds = ("0" + new Date().getSeconds()).slice(-2);
    const datahora = day + "/" + month + "/" + year + " " + hours + ":" + minutes + ":" + seconds;
    
    const logDir = path.join(__dirname, "../logs"); // Caminho do diretório
    const file = path.join(logDir, `${year}${month}${day}.txt`); // Caminho completo do arquivo
    
    // Verifica e cria o diretório, se necessário
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }

    // Escreve no arquivo
    fs.appendFileSync(file, "========================================" + datahora + "========================================");
    fs.appendFileSync(file, "\r\n");
    fs.appendFileSync(file, texto);
    fs.appendFileSync(file, "\r\n");
};
