import express from "express";
import { Router } from "express";
import { readFile, writeFile } from "fs"; 
import { join } from "path";
import { v4 as uuidv4 } from "uuid"; 

const routeProducts = Router();

// Ruta del archivo JSON
const productsPath = join(process.cwd(), "datos", "products.json");

// Obtener todos los productos
routeProducts.get("/", (req, res) => {
    readFile(productsPath, "utf-8", (err, data) => {
        if (err) {
            res.status(500).json({ error: "Error al cargar los productos" });
            return;
        }

        const products = JSON.parse(data);
        res.json(products);
    });
});

// Obtener producto por ID
routeProducts.get("/:pid", (req, res) => {
    const pid = req.params.pid;

    readFile(productsPath, "utf-8", (err, data) => {
        if (err) {
            res.status(500).json({ error: "Error al cargar los productos" });
            return;
        }

        try {
            const products = JSON.parse(data);
            const product = products.find(p => p.id == pid);

            if (!product) {
                res.status(404).json({ error: "Producto no encontrado" });
                return;
            }

            res.json(product);
        } catch (error) {
            res.status(500).json({ error: "Error al procesar los datos" });
        }
    });
});


// Agregar un nuevo producto con un ID autogenerado
routeProducts.post("/", (req, res) => {
    readFile(productsPath, "utf-8", (err, data) => {
        if (err) {
            res.status(500).json({ error: "Error al cargar los productos" });
            return;
        }

        try {
            const products = JSON.parse(data);
            const newProduct = { id: uuidv4(), ...req.body }; // Generamos un ID único

            products.push(newProduct);

            writeFile(productsPath, JSON.stringify(products, null, 2), "utf-8", (err) => {
                if (err) {
                    res.status(500).json({ error: "Error al guardar el producto" });
                    return;
                }
                res.status(201).json(newProduct);
            });

        } catch (error) {
            res.status(500).json({ error: "Error al procesar los datos" });
        }
    });
});  


routeProducts.put("/:pid", (req, res) => {
    const pid = req.params.pid;

    readFile(productsPath, "utf-8", (err, data) => {
        if (err) {
            res.status(500).json({ error: "Error al leer los productos" });
            return;
        }

        try {
            const products = JSON.parse(data);
            const productIndex = products.findIndex(p => p.id == pid);

            if (productIndex === -1) {
                res.status(404).json({ error: "Producto no encontrado" });
                return;
            }

            //  Actualizamos solo las propiedades enviadas en el body
            products[productIndex] = { ...products[productIndex], ...req.body };

            // Guardamos el archivo actualizado
            writeFile(productsPath, JSON.stringify(products, null, 2), "utf-8", (err) => {
                if (err) {
                    res.status(500).json({ error: "Error al guardar los cambios" });
                    return;
                }
                res.json(products[productIndex]); // Enviamos el producto actualizado
            });

        } catch (error) {
            res.status(500).json({ error: "Error al procesar los datos" });
        }
    });
});

routeProducts.delete("/:pid", (req, res) => {
    const pid = req.params.pid;

    readFile(productsPath, "utf-8", (err, data) => {
        if (err) {
            res.status(500).json({ error: "Error al leer los productos" });
            return;
        }

        try {
            let products = JSON.parse(data);
            const productIndex = products.findIndex(p => p.id == pid);

            if (productIndex === -1) {
                res.status(404).json({ error: "Producto no encontrado" });
                return;
            }

            // Eliminamos el producto del array
            const deletedProduct = products.splice(productIndex, 1)[0];

            // Guardamos el archivo actualizado
            writeFile(productsPath, JSON.stringify(products, null, 2), "utf-8", (err) => {
                if (err) {
                    res.status(500).json({ error: "Error al guardar los cambios" });
                    return;
                }
                res.json({ message: "Producto eliminado", deletedProduct });
            });

        } catch (error) {
            res.status(500).json({ error: "Error al procesar los datos" });
        }
    });
});

export default routeProducts;
