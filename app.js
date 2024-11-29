/*
    API server for RJTI Chart webapp
    Author : Rohit Kumar Pandit
    Github : https://github.com/rohit-64bit
    Email : rohitpandit9051@gmail.com
*/

const express = require('express');
const app = express();
const cors = require('cors');

require('dotenv').config({
    path: './config/.env'
});

const API_VERSION = `/api/v1`;

const node_env = process.env.ENVIRONMENT;

const DEV_ORIGINS = ['http://localhost:5173/', 'http://localhost:5174/', 'http://localhost:5173', 'http://localhost:5174']

const PROD_ORIGINS = ['https://rjticharts.com/','https://www.rjticharts.com/','https://www.rjticharts.com', 'https://admin.rjticharts.com/', 'https://rjticharts.com', 'https://admin.rjticharts.com']

// Middleware
app.use(cors({
    origin: node_env === 'prod' ? PROD_ORIGINS : DEV_ORIGINS,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token', 'token', 'reset-token'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Default Route

app.get('/', (req, res) => {
    res.send('Hello World');
})

// Routes

app.use(`${API_VERSION}/user`, require('./routes/user.routes'));
app.use(`${API_VERSION}/admin`, require('./routes/admin.routes'));
app.use(`${API_VERSION}/payment`, require('./routes/payment.routes'));
app.use(`${API_VERSION}/category`, require('./routes/category.routes'));
app.use(`${API_VERSION}/package`, require('./routes/package.routes'));
app.use(`${API_VERSION}/content`, require('./routes/content.routes'));
app.use(`${API_VERSION}/query`, require('./routes/query.routes'));
app.use(`${API_VERSION}/s3`, require('./routes/s3.routes'));
app.use(`${API_VERSION}/blog`, require('./routes/blog.routes'));
app.use(`${API_VERSION}/trading-system`, require('./routes/tradingsystem.routes'));


module.exports = app;