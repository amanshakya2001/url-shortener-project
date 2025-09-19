const { verifyJWTToken } = require("../utils/auth");

const checkAuthentication = () => {
    return (req, res, next) => {
        try{
            let { sessionid } = req.cookies;
            let { id,email } = verifyJWTToken(sessionid);
            req.email = email;
            req.id = id;
        }
        catch(error){
            req.email = null;
            req.id = null;
        }
        return next();
    }
}

module.exports = {
    checkAuthentication
}