import express from "express";
import routeProducts from "./routes/products.route.js";
import routeCarts from "./routes/carts.route.js";
import handlebars from "express-handlebars";
import path from "path";
import fs from "fs/promises"; // Importamos fs para manejar archivos de manera asíncrona
import { Server } from "socket.io";

const app = express();

app.engine("handlebars", handlebars.engine());

app.set("views", path.join(process.cwd(), "views"));
app.set("view engine", "handlebars");

app.use(express.json());

app.use("/api/carts", routeCarts);
app.use("/api/products", routeProducts);

app.get("/perfil", (req, res) => {
  res.render("profile", { nombre: "Pedro" });
});

// Nueva ruta para renderizar JSON en la vista "home"
app.get("/principal", async (req, res) => {
  try {
    // Ruta absoluta al archivo "products.json" dentro de la carpeta "datos"
    const filePath = path.join(process.cwd(), "datos", "products.json");
    
    // Leer el archivo JSON
    const data = await fs.readFile(filePath, "utf-8");
    
    // Convertir el JSON a un objeto
    const productos = JSON.parse(data);

    // Renderizar la vista "home" y pasarle los productos
    res.render("home", { productos });
  } catch (error) {
    console.error("Error al leer el archivo JSON:", error);
    res.status(500).send("Error al cargar los datos.");
  }
});

const PUERTO = 8080;

app.listen(PUERTO, () => {
  console.log(`El servidor está escuchando en el puerto ${PUERTO}`);
});