const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const { config } = require("dotenv").config();
const bookRoutes = require("./routes/book.routes");

//usamos express para utilizar middlewares
const app = express();

//Como es un middleware se usa para parsear lo que viene del body (transformarlo en json)
app.use(bodyParser.json());


//conexion de la base de datos Mongo
mongoose.connect(process.env.MONGO_URL, {dbName: process.env.MONGO_DB_NAME});
const db = mongoose.connect;

app.use('/books', bookRoutes); //definimos la ruta principal


const port = process.env.port || 3000;

app.listen(port, () => {
  console.log(`Servidor iniciado en el puerto ${port}`);
});
