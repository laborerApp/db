const { Console } = require('console');
const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;
var DATA_FILE = null

// Middleware para parsear JSON en las solicitudes
app.use(express.json());

function getPathData(Id) {

    if (Id === null) {
        // Validar que el archivo existe
        return res.status(404).json({ error: 'id no encontrado. Primero debe crear el repositorio.' });
    }
    if (DATA_FILE === null) {
        // Crear el directorio "data" si no existe
        if (!fs.existsSync(path.join(__dirname, 'data'))) {
            fs.mkdirSync(path.join(__dirname, 'data'));
        }
        return DATA_FILE = path.join(__dirname, 'data', `db_${Id}.json`);
    }
    else
        return DATA_FILE;

}

// Función para crear un nuevo repositorio
function creaRepositorio() {
    const Id = uuidv4(); // Generar un UUID único
    fs.writeFileSync(path.join(__dirname, 'data', `db_${Id}.json`), JSON.stringify([]));
    return Id; // Devolver el UUID generado
}
// funcion para guardar 
function saveData(Id, data) {
    fs.writeFileSync(getPathData(Id), JSON.stringify(data, null, 2));
}

// Cargar datos desde el archivo JSON
function loadData(Id) {
    try {
        return JSON.parse(fs.readFileSync(getPathData(Id), 'utf8'));
    }

    catch (error) {
      return  error.message = 'Error loading data:' + getPathData(Id);
    }
}

// Ruta GET para crear un nuevo repositorio
app.get('/api/creaRepositorio', (req, res) => {
    res.json({ id: creaRepositorio(), message: 'Repositorio creado correctamente' });
});

// Ruta POST New item
app.post('/api/item/:Id', (req, res) => {
    const data = loadData(req.params.Id);

    const newItem = {
        id: uuidv4(),
        ...req.body
    };
    data.push(newItem);
    saveData(req.params.Id, data);
    res.status(201).json(newItem);

});

// Ruta GET id Items
app.get('/api/item/:Id/:IdItem', (req, res) => {
    const data = loadData(req.params.Id);
    const item = data.find(i => i.id === req.params.IdItem);
    if (item) {
        res.json(item);
    } else {
        res.status(404).json({ message: 'Item not found' });
    }
});

// Ruta GET all Items
app.get('/api/items/:Id', (req, res) => {
  
    console.log(`GET /api/items/:Id called with Id: ${req.params.Id}`);  try {
        const Id = req.params.Id;
        if (!Id) {
            Console.log('entra en error ');
            throw "Error: 'id de repositorio encontrado.";
        }
        const data = loadData(req.params.Id);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error });
    }
});

// Actualizar un registro por ID
app.put('/api/item/:Id/:IdItem', (req, res) => {
    try {
        const data = loadData(req.params.Id);
        const index = data.findIndex(i => i.id === req.params.IdItem);
        console.log(index);
        if (index !== -1) {
            data[index] = { ...data[index], ...req.body };
            console.log(data[index]);
            saveData(req.params.Id, data);
            res.json(data[index]);
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating data' });
    }
});

// Eliminar un registro por ID
app.delete('/api/item/:Id/:IdItem', (req, res) => {
    const data = loadData(req.params.Id);
    const index = data.findIndex(i => i.id === req.params.IdItem);
    if (index !== -1) {
        const deletedItem = data.splice(index, 1);
        saveData(req.params.Id, data);
        res.json(deletedItem);
    } else {
        res.status(404).json({ message: 'Item not found' });
    }
});

// Iniciar el servidor
app.listen(PORT, (error) => {
    if (error) {
        console.error('Error al iniciar el servidor:', error);
        process.exit(1); // Salir del proceso en caso de error
    } else {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
    }
});