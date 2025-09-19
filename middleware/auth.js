const { verifyJWTToken } = require("../utils/auth");

const checkAuthentication = () => {
    return (req, res, next) => {
        try{
            let { sessionid } = req.cookies;
            let { email } = verifyJWTToken(sessionid);
            req.email = email;
        }
        catch(error){
            req.email = null;
        }
        return next();
    }
}

module.exports = {
    checkAuthentication
}