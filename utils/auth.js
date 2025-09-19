const jwt = require('jsonwebtoken');
const privateKey = "amanshakyavedantomrachit!@#$$31"

const createJWTToken = (email) => {
    return jwt.sign({ email  }, privateKey);
}

const verifyJWTToken = (token) => {
    return jwt.verify(token,privateKey);
}

module.exports = {
    createJWTToken,
    verifyJWTToken
}