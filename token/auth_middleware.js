const jwt = require("jsonwebtoken");
const { secretKey } = require("../token/jwt");

const authMiddleware = (req, res, next) => {
    //const token = req.headers["x-access-token"];
    const token = req.headers["authorization"] && req.headers["authorization"].split(" ")[1];

    if (!token) {
        return res.status(403).send({ message: "Token não fornecido!" });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            console.log("Erro ao verificar o token:", err);
            return res.status(401).send({ message: "Token inválido!" });
        }
        req.userId = decoded.id;
        next();
    });
};

module.exports = authMiddleware;
