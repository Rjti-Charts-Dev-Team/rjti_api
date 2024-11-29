const Admin = require("../models/Admin");
const errorLogger = require("../utils/errorLogger");
const jwt = require("jsonwebtoken");

const verifyAdmin = async (req, res, next) => {

    try {

        const token = req.header('x-auth-token');

        if (!token) {
            return res.status(401).json({
                level:"0",
                errType: "auth-error",
                error: 'No token, authorization denied'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.adminAccessSecret !== process.env.ADMIN_ACCESS_CODE) {
            return res.status(401).json({
                level:"1",
                errType: "auth-error",
                error: 'Invalid token, authorization denied'
            });
        }

        const admin = await Admin.findById(decoded.id);

        if (!admin) {
            return res.status(401).json({
                level:"2",
                errType: "auth-error",
                error: 'Invalid token, authorization denied'
            });
        }

        req.admin = decoded;

        next();

    } catch (error) {

        errorLogger(error, req, res);

    }

}

module.exports = verifyAdmin;