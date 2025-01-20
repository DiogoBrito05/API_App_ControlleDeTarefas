const express = require('express');  
const router = express.Router();
const db = require("../config/db.js");
const log = require("../config/log.js");
const authMiddleware = require("../token/auth_middleware.js");

// Criar uma nova tarefa
router.post('/tasks', authMiddleware, async (req, res) => {
    const { titulo, descricao, prioridade, status, dataLimite } = req.body;
    const userId = req.userId;

    if (!titulo) {
        return res.status(400).send({ message: "Título da tarefa não pode estar vazio!" });
    }

    try {
        const sql = "INSERT INTO tarefas (titulo, descricao, prioridade, status, data_limite, id_usuario) VALUES (?, ?, ?, ?, ?, ?)";
        const values = [titulo, descricao, prioridade || 'media', status || 'pendente', dataLimite, userId];
        
        db.execute(sql, values, (err, result) => {
            if (err) {
                log.gravalog(`Erro ao criar tarefa: ${err.message}`);
                return res.status(500).send({ message: "Erro ao criar a tarefa." });
            }

            res.status(201).send({ message: "Tarefa criada com sucesso!", taskId: result.insertId });
        });
    } catch (err) {
        log.gravalog(`Catch /tasks falhou: ${err.message}`);
        res.status(500).send({ message: "Erro interno." });
    }
});


// Atualizar tarefa
router.put('/tasks/:id', authMiddleware, async (req, res) => {
    const taskId = req.params.id;
    const { titulo, descricao, prioridade, status, dataLimite } = req.body;
    const userId = req.userId;

    const checkTaskSql = "SELECT * FROM tarefas WHERE id_tarefa = ? AND id_usuario = ?";
    db.execute(checkTaskSql, [taskId, userId], (err, result) => {
        if (err) {
            log.gravalog(`Erro ao verificar tarefa: ${err.message}`);
            return res.status(500).send({ message: "Erro ao verificar tarefa." });
        }

        if (result.length === 0) {
            return res.status(403).send({ message: "Tarefa não encontrada ou você não tem permissão para editá-la." });
        }

        const currentTask = result[0];
        const updateTitulo = titulo !== undefined ? titulo : currentTask.titulo;
        const updateDescricao = descricao !== undefined ? descricao : currentTask.descricao;
        const updatePrioridade = prioridade !== undefined ? prioridade : currentTask.prioridade;
        const updateStatus = status !== undefined ? status : currentTask.status;
        const updateDataLimite = dataLimite !== undefined ? dataLimite : currentTask.data_limite;

        
        const updateSql = "UPDATE tarefas SET titulo = ?, descricao = ?, prioridade = ?, status = ?, data_limite = ? WHERE id_tarefa = ? AND id_usuario = ?";
        const updateValues = [updateTitulo, updateDescricao, updatePrioridade, updateStatus, updateDataLimite, taskId, userId];

        db.execute(updateSql, updateValues, (err, result) => {
            if (err) {
                log.gravalog(`Erro ao atualizar tarefa: ${err.message}`);
                return res.status(500).send({ message: "Erro ao atualizar a tarefa." });
            }

            if (result.affectedRows > 0) {
                res.status(200).send({ message: "Tarefa atualizada com sucesso!" });
            } else {
                res.status(404).send({ message: "Tarefa não encontrada." });
            }
        });
    });
});



// Listar tarefas do usuário
router.get('/tasks', authMiddleware, async (req, res) => {
    const userId = req.userId;

    const sql = "SELECT * FROM tarefas WHERE id_usuario = ?";
    db.execute(sql, [userId], (err, result) => {
        if (err) {
            log.gravalog(`Erro ao listar tarefas: ${err.message}`);
            return res.status(500).send({ message: "Erro ao listar tarefas." });
        }

        if (result.length > 0) {
            res.status(200).send(result); 
        } else {
            res.status(404).send({ message: "Nenhuma tarefa encontrada." });
        }
    });
});


// Deletar tarefa
router.delete('/tasks/:id', authMiddleware, async (req, res) => {
    const taskId = req.params.id;
    const userId = req.userId;

    
    const checkTaskSql = "SELECT * FROM tarefas WHERE id_tarefa = ? AND id_usuario = ?";
    db.execute(checkTaskSql, [taskId, userId], (err, result) => {
        if (err) {
            log.gravalog(`Erro ao verificar tarefa: ${err.message}`);
            return res.status(500).send({ message: "Erro ao verificar tarefa." });
        }

        if (result.length === 0) {
            return res.status(403).send({ message: "Tarefa não encontrada ou você não tem permissão para deletá-la." });
        }

        
        const deleteSql = "DELETE FROM tarefas WHERE id_tarefa = ? AND id_usuario = ?";
        db.execute(deleteSql, [taskId, userId], (err, result) => {
            if (err) {
                log.gravalog(`Erro ao deletar tarefa: ${err.message}`);
                return res.status(500).send({ message: "Erro ao deletar a tarefa." });
            }

            if (result.affectedRows > 0) {
                res.status(200).send({ message: "Tarefa deletada com sucesso!" });
            } else {
                res.status(404).send({ message: "Tarefa não encontrada." });
            }
        });
    });
});

module.exports = router;

