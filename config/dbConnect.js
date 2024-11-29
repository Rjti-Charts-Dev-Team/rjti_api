const mongoose = require('mongoose');

const environment = process.env.ENVIRONMENT;

const dbConnect = async () => {

    try {

        const dbHost = await mongoose.connect(`${process.env.MONGO_URI}${environment === 'dev' ? process.env.DB_NAME_DEV : process.env.DB_NAME_PROD}`);


        console.log('Database connected successfully', dbHost.connection.host);

    } catch (error) {

        console.error('Error connecting to database', error);

    }

}

module.exports = dbConnect;