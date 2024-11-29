const User = require("../models/User");
const errorLogger = require("../utils/errorLogger");
const jwt = require("jsonwebtoken");

const verifyUser = async (req, res, next) => {

    try {

        const token = req.header('token');

        if (!token) {
            return res.status(400).json({
                error: 'Invalid request',
                redirect: '/login',
                level: 1
            });
        }

        const decode = jwt.verify(token, process.env.JWT_SECRET);

        if (!decode) {
            return res.status(400).json({
                error: 'Invalid request',
                redirect: '/login',
                level: 2
            });
        }

        const user = await User.findById(decode.id);

        if (!user) {
            return res.status(400).json({
                error: 'Invalid request',
                redirect: '/login',
                level: 3
            });
        }

        req.decode = decode;
        req.verifyUser = user;

        next();

    } catch (error) {

        errorLogger(error, req, res);

    }

}

module.exports = verifyUser;