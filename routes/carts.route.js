import express from "express";
import { Router } from "express";
import { promises as fs } from "fs"; // Usamos fs.promises para manejar promesas
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

const routeCarts = Router();
const cartsPath = join(process.cwd(), "datos", "carts.json");

// Función para leer el archivo JSON
const readCartsFile = async () => {
    try {
        const data = await fs.readFile(cartsPath, "utf-8");
        return JSON.parse(data);
    } catch (err) {
        if (err.code === "ENOENT") {
            return []; // Si el archivo no existe, retornamos un array vacío
        }
        throw err;
    }
};

// Función para escribir en el archivo JSON
const writeCartsFile = async (carts) => {
    await fs.writeFile(cartsPath, JSON.stringify(carts, null, 2), "utf-8");
};

// Endpoint para crear un nuevo carrito
routeCarts.post("/", async (req, res) => {
    try {
        const carts = await readCartsFile();

        const newCart = { id: uuidv4(), products: [] }; // Carrito nuevo vacío
        carts.push(newCart);

        await writeCartsFile(carts);

        res.status(201).json(newCart);
    } catch (error) {
        res.status(500).json({ error: "Error al procesar la solicitud" });
    }
});

// Endpoint para obtener los productos de un carrito específico
routeCarts.get("/:cid", async (req, res) => {
    try {
        const { cid } = req.params;
        const carts = await readCartsFile();

        const cart = carts.find(cart => cart.id === cid);
        if (!cart) {
            return res.status(404).json({ error: "Carrito no encontrado" });
        }

        res.json(cart.products);
    } catch (error) {
        res.status(500).json({ error: "Error al procesar la solicitud" });
    }
});

export default routeCarts;
