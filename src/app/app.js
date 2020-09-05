const path = require("path");
const env = path.join(__dirname, '../../.env');
require('dotenv').config({path:env});

const http = require("http");
const express = require('express');
const cors = require('cors')

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;

console.log("Port", process.env.PORT)

app.use(cors());

// Routes
const homepage = require('./routes/homepage');

app.use('/', homepage);

server.listen(port, ()=>{
    console.log(`Server started on port: ${port}!`);
});