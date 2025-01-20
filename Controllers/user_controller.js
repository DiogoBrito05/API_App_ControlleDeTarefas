const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../config/db");
const log = require("../config/log.js");
const router = express.Router();
//const jwt = require('jsonwebtoken');
//const authMiddleware = require('../middlewares/auth');
const jwtUtils = require("../token/jwt.js");
const authMiddleware = require("../token/auth_middleware.js");  


// Registrar um novo usuário
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).send({ message: "Preencha todos os campos!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)";
        const values = [username, email, hashedPassword];

        db.execute(sql, values, (err, result) => {
            if (err) {
                log.gravalog(`Erro ao criar usuário: ${err.message}`);
                return res.status(500).send({ message: "Erro ao criar usuário." });
            }
            res.status(201).send({ message: "Usuário criado com sucesso!", userId: result.insertId });
        });
    }   catch (err) {
        log.gravalog(`Catch /register falhou: ${err.message}`);
        res.status(500).send({ message: "Erro interno." });
    }
});

// Atualizar usuário
router.put('/users/update/:id', authMiddleware, async (req, res) => {
    const userIdFromToken = req.userId; 
    const userId = req.params.id; 
    const { username, email, password } = req.body;

    
    if (userIdFromToken !== parseInt(userId)) {
        return res.status(403).send({ message: "Você não tem permissão para atualizar os dados de outro usuário!" });
    }

    try {
        // Buscando o usuário no banco de dados
        const sql = "SELECT * FROM usuarios WHERE id_usuario = ?";
        const values = [userId];

        db.query(sql, values, async (err, result) => {
            if (err) {
                log.gravalog(`Erro ao buscar usuário para atualização: ${err.message}`);
                return res.status(500).send({ message: "Erro ao buscar usuário." });
            }

            if (result.length === 0) {
                return res.status(404).send({ message: "Usuário não encontrado!" });
            }

            const user = result[0];
            const updateUsername = username !== undefined ? username : user.nome;
            const updateEmail = email !== undefined ? email : user.email;
            const updatePassword = password !== undefined ? await bcrypt.hash(password, 10) : user.senha;


            const updateSql = "UPDATE usuarios SET nome = ?, email = ?, senha = ? WHERE id_usuario = ?";
            const updateValues = [updateUsername, updateEmail, updatePassword, userId];

            db.query(updateSql, updateValues, (err, result) => {
                if (err) {
                    log.gravalog(`Erro ao atualizar usuário: ${err.message}`);
                    return res.status(500).send({ message: "Erro ao atualizar usuário." });
                }

                if (result.affectedRows > 0) {
                    res.status(200).send({ message: "Usuário atualizado com sucesso!" });
                } else {
                    res.status(404).send({ message: "Usuário não encontrado." });
                }
            });
        });
    } catch (err) {
        log.gravalog(`Erro interno na atualização: ${err.message}`);
        res.status(500).send({ message: "Erro interno ao atualizar usuário." });
    }
});


// Login de usuário
router.post('/users/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({ message: "Email e senha são obrigatórios!" });
    }

    try {
        // Buscando o usuário pelo email
        const sql = "SELECT * FROM usuarios WHERE email = ?";
        const values = [email];

        db.query(sql, values, async (err, result) => {
            if (err) {
                console.error("Erro ao buscar usuário:", err);
                return res.status(500).send({ message: "Erro ao buscar usuário." });
            }

            if (result.length === 0) {
                return res.status(404).send({ message: "Usuário não encontrado!" });
            }

            const user = result[0];

            // Comparando a senha informada com a armazenada no banco
            const isPasswordValid = await bcrypt.compare(password, user.senha);

            if (isPasswordValid) {
                const token = jwtUtils.generateToken(user);
                res.status(200).send({ message: "Login realizado com sucesso!", token });
            } else {
                res.status(401).send({ message: "Senha incorreta!" });
            }
        });
    } catch (err) {
        res.status(500).send({ message: err.message || "Erro ao fazer login." });
    }
});

module.exports = router;
