const jwt = require("jsonwebtoken");
const secretKey = "123456";

// Gera token JWT
exports.generateToken = (user) => {
    return jwt.sign(
        { id: user.id_usuario, email: user.email, nome: user.nome},
        secretKey, 
        { expiresIn: "1h" }
    );
};

// Decodifica token JWT
exports.decodeToken = (token) => {
    try {
        return jwt.verify(token, secretKey);
    } catch (err) {
        return null;
    }
};


exports.secretKey = secretKey;
