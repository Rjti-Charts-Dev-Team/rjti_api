const errorLogger = async (error, req, res) => {

    console.error(error);

    res.status(500).json({
        error: 'Internal server error'
    });

}

module.exports = errorLogger;