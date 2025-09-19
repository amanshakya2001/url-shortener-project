const jwt = require('jsonwebtoken');
const privateKey = process.env.JWT_SECRET;
console.log(privateKey);

const createJWTToken = (payload) => {
    return jwt.sign(payload, privateKey);
}

const verifyJWTToken = (token) => {
    return jwt.verify(token,privateKey);
}

module.exports = {
    createJWTToken,
    verifyJWTToken
}