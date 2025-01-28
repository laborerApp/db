const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;

// Middleware para parsear JSON en las solicitudes
app.use(express.json());

// Función para crear un nuevo repositorio
function creaRepositorio() {
    const userId = uuidv4(); // Generar un UUID único
    const userFilePath = path.join(__dirname, 'data', `usuario_${userId}.json`); // Ruta del archivo

    // Crear el directorio "data" si no existe
    if (!fs.existsSync(path.join(__dirname, 'data'))) {
        fs.mkdirSync(path.join(__dirname, 'data'));
    }

    // Crear un archivo JSON vacío
    fs.writeFileSync(userFilePath, JSON.stringify({}), 'utf8');

    return userId; // Devolver el UUID generado
}

// Ruta GET para crear un nuevo repositorio
app.get('/api/creaRepositorio', (req, res) => {
    const userId = creaRepositorio(); // Crear un nuevo repositorio
    res.json({ userId, message: 'Repositorio creado correctamente' });
});

// Ruta POST para actualizar los datos de un usuario
app.post('/api/data/:userId', (req, res) => {
    const userId = req.params.userId; // Obtener el UUID del usuario desde la URL
    const userFilePath = path.join(__dirname, 'data', `usuario_${userId}.json`); // Ruta del archivo

    // Validar que el archivo existe
    if (!fs.existsSync(userFilePath)) {
        return res.status(404).json({ error: 'Usuario no encontrado. Primero debe crear el repositorio.' });
    }

    const newData = req.body; // Datos enviados en el cuerpo de la solicitud

    // Leer el archivo actual y actualizar los datos
    fs.readFile(userFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error al leer el archivo' });
        }

        const userData = JSON.parse(data); // Datos actuales del usuario
        const updatedData = { ...userData, ...newData }; // Fusionar datos actuales con los nuevos

        // Escribir los datos actualizados en el archivo
        fs.writeFile(userFilePath, JSON.stringify(updatedData, null, 2), 'utf8', (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error al escribir en el archivo' });
            }
            res.json({ userId, message: 'Datos actualizados correctamente', data: updatedData });
        });
    });
});

// Ruta GET para leer el contenido del archivo JSON de un usuario
app.get('/api/data/:userId', (req, res) => {
    const userId = req.params.userId; // Obtener el userId desde la URL
    const userFilePath = path.join(__dirname, 'data', `usuario_${userId}.json`); // Ruta del archivo

    // Verificar si el archivo existe
    if (!fs.existsSync(userFilePath)) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Leer el archivo JSON
    fs.readFile(userFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error al leer el archivo' });
        }

        const userData = JSON.parse(data); // Parsear el contenido del archivo
        res.json({ userId, data: userData }); // Devolver el contenido
    });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});