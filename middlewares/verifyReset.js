const errorLogger = require("../utils/errorLogger");
const jwt = require("jsonwebtoken");

const verifyReset = async (req, res, next) => {

    try {

        const resetToken = req.header('reset-token');

        if (!resetToken) {
            return res.status(400).json({
                error: 'Invalid request'
            });
        }

        const decode = await jwt.verify(resetToken, process.env.JWT_SECRET);

        if (!decode) {
            return res.status(400).json({
                error: 'Invalid request'
            });
        }

        req.decode = decode;
        req.resetToken = resetToken;

        next();

    } catch (error) {

        errorLogger(error, req, res);

    }

}

module.exports = verifyReset;