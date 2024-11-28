const express = require('express');
const path = require('path');
const multer = require('multer');
const app = express();
const fs = require('fs');
app.use(express.json()); // Necesario para parsear JSON en las solicitudes
// Middleware para procesar datos del formulario que no son archivos
app.use(express.urlencoded({ extended: true }));
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const { modo } = req.headers;
        const { tipo } = req.headers;
        const folderPath = `uploads/${tipo}/${modo}`;
        cb(null, folderPath); // Asigna la carpeta destino
    },
    filename: (req, file, cb) => {
        const sufijo = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + sufijo + ext); // Nombre del archivo
    }
});

const upload = multer({ storage });

// Ruta para manejar la subida de archivos y campos
app.post('/upload', upload.single('file'), (req, res) => {
    if (req.file) {
        // Construye el path completo del archivo subido
        const filePath = path.join(req.file.destination, req.file.filename);
        const normalizedFilePath = filePath.replace(/\\/g, '/');
        return res.json({
            error: false,
            mensaje: 'Archivo agregado',
            path: "/" + normalizedFilePath,
            filename: req.file.originalname
        });
    } else {
        return res.json({
            error: true,
            path: ''
        })
    }
});
app.post('/delete', (req, res) => {
    try {
        // Construye una ruta relativa a la raíz del proyecto
        const relativePath = path.join(__dirname, req.headers.path);

        console.log('Ruta completa relativa:', relativePath);

        // Verifica si el archivo existe
        if (!fs.existsSync(relativePath)) {
            console.log('Archivo no encontrado:', relativePath);
            return res.status(404).json({ error: true, message: 'Archivo no encontrado' });
        }

        fs.unlinkSync(relativePath);
        console.log('Eliminado correctamente');
        return res.json({ error: false });
    }
    catch (e) {
        console.log('Error al eliminar archivo:', e);
        return res.status(500).json({ error: true, message: 'Error al eliminar archivo' });
    }
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Inicia el servidor
app.listen(4000, () => {
    console.log('Escuchando en el puerto 4000');
});
