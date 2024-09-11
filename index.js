const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs'); // Importa fs para manejar la creación de carpetas
const app = express();

// Middleware para procesar datos del formulario que no son archivos
app.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const { modo } = req.headers;
        const { tipo } = req.headers;
        const folderPath = path.join(__dirname, 'uploads', tipo, modo); // Define la ruta absoluta

        // Verifica si la carpeta existe, si no, la crea
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true }); // Crea las carpetas de manera recursiva
        }

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
            filename: req.file.filename
        });
    } else {
        return res.json({
            error: true,
            path: ''
        });
    }
});

// Servir archivos estáticos desde la carpeta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Inicia el servidor
app.listen(process.env.PORT || 4000, () => {
    console.log('A la escucha');
});
