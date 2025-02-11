import express from "express";
import routeProducts from "./routes/products.route.js";
import routeCarts from "./routes/carts.route.js";

const app = express()

app.use(express.json()); //Necesario para leer JSON en req.body

app.use("/api/carts", routeCarts )

app.use("/api/products", routeProducts)



const PUERTO = 8080;

app.listen(PUERTO, () => {
  console.log(`El servidor está escuchando en el puerto ${PUERTO}`);
});