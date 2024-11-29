/*
    API server for RJTI Chart webapp
    Author : Rohit Kumar Pandit
    Github : https://github.com/rohit-64bit
    Email : rohitpandit9051@gmail.com
*/

const app = require("./app");
const dbConnect = require("./config/dbConnect");

require("dotenv").config({
    path: "./config/.env"
});

const PORT = process.env.PORT;

dbConnect();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});