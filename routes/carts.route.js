import express from "express";
import { Router } from "express";
import { promises as fs } from "fs";
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

// Endpoint para crear un nuevo carrito con productos opcionales
routeCarts.post("/", async (req, res) => {
    try {
        const carts = await readCartsFile();

        // Si el body contiene productos, agregamos un ID único a cada uno
        const products = req.body.products?.map(product => ({
            id: uuidv4(),  // Generamos un ID único para cada producto
            quantity: product.quantity || 1 // Si no se envía quantity, se asume 1
        })) || [];

        const newCart = {
            id: uuidv4(),  // ID del carrito
            products       // Lista de productos con ID autogenerado
        };

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

// Endpoint para agregar un producto a un carrito
routeCarts.post("/:cid/product/:pid", async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity } = req.body; // La cantidad se enviará en el body de la petición
        const carts = await readCartsFile();

        const cartIndex = carts.findIndex(cart => cart.id === cid);
        if (cartIndex === -1) {
            return res.status(404).json({ error: "Carrito no encontrado" });
        }

        const cart = carts[cartIndex];

        // Verificar si el producto ya existe en el carrito
        const productIndex = cart.products.findIndex(product => product.id === pid);
        if (productIndex !== -1) {
            // Si el producto existe, se incrementa la cantidad
            cart.products[productIndex].quantity += quantity || 1;
        } else {
            // Si no existe, se agrega un nuevo producto con su ID único
            const newProduct = { id: pid, quantity: quantity || 1 };
            cart.products.push(newProduct);
        }

        // Guardar los cambios en el archivo
        await writeCartsFile(carts);

        res.status(201).json(cart);
    } catch (error) {
        res.status(500).json({ error: "Error al procesar la solicitud" });
    }
});

export default routeCarts;

