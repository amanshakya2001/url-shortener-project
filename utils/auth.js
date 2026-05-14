const jwt = require('jsonwebtoken');

const privateKey = process.env.JWT_SECRET;

const createJWTToken = (payload) => jwt.sign(payload, privateKey, { expiresIn: '7d' });

const verifyJWTToken = (token) => jwt.verify(token, privateKey);

module.exports = { createJWTToken, verifyJWTToken };
