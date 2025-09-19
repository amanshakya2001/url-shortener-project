const { verifyJWTToken } = require("../utils/auth");

const checkAuthentication = () => {
    return (req, res, next) => {
        try{
            let { sessionid } = req.cookies;
            let { id, email, role } = verifyJWTToken(sessionid);
            req.email = email;
            req.id = id;
            req.role = role;
        }
        catch(error){
            req.email = null;
            req.id = null;
            req.role = null;
        }
        return next();
    }
}

module.exports = {
    checkAuthentication
}