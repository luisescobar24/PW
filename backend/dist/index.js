"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../prisma/generated/prisma"); // No cambiar esta importación
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv")); // Para cargar variables de entorno
const crypto_1 = __importDefault(require("crypto"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config(); // Cargar las variables de entorno desde .env
const app = (0, express_1.default)();
const prisma = new prisma_1.PrismaClient(); // Inicializando el cliente de Prisma
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173', // Solo permitir solicitudes desde este origen
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'], // Agrega los encabezados que deseas permitir
}));
// Middleware para parsear el cuerpo de las peticiones como JSON
app.use(express_1.default.json());
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Token requerido' });
    }
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido' });
        }
        req.user = decoded;
        next();
    });
}
function authorizeAdmin(req, res, next) {
    if (req.user && req.user.rol === 'ADMIN') {
        return next();
    }
    return res.status(403).json({ message: 'Acceso denegado' });
}
// Ruta para obtener todos los usuarios
app.get('/api/usuarios', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const usuarios = yield prisma.usuario.findMany({
            select: {
                id: true,
                correo: true,
                nombre: true,
                estado: true,
            },
        });
        // Verifica los datos que estamos obteniendo antes de enviarlos
        console.log('Usuarios desde la base de datos:', usuarios);
        if (usuarios.length === 0) {
            return res.status(404).json({ message: 'No hay usuarios disponibles' });
        }
        return res.status(200).json(usuarios); // Devolver la lista de usuarios
    }
    catch (error) {
        console.error('Error al obtener los usuarios:', error);
        return res.status(500).json({ message: 'Error al obtener los usuarios' });
    }
}));
// Ruta para registrar ventas
app.post('/api/ventas', authenticateToken, authorizeAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { ventas } = req.body;
    if (!ventas || !Array.isArray(ventas) || ventas.length === 0) {
        return res.status(400).json({ message: 'No hay ventas para registrar' });
    }
    try {
        // Inicia una transacción para registrar todas las ventas
        const result = yield prisma.$transaction(ventas.map((venta) => prisma.venta.create({
            data: {
                fecha: venta.fecha,
                usuarioId: venta.usuarioid, // Suponiendo que el usuario está autenticado y su id está presente
                juegoId: venta.juegoid,
                codigo: crypto_1.default.randomBytes(16).toString('hex'), // Generar un código único para la venta
                montoPagado: venta.monto_pagado,
                // No necesitamos "cantidad" aquí, ya que es una propiedad en el frontend
            }
        })));
        // Si la transacción fue exitosa
        return res.status(201).json({ message: 'Ventas registradas correctamente', result });
    }
    catch (error) {
        console.error('Error al registrar ventas:', error);
        return res.status(500).json({ message: 'Error al registrar ventas' });
    }
}));
// Ruta para obtener todos los juegos
app.get('/api/juegos', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { plataformaId, categoriaId } = req.query; // Recibe los IDs como parámetros
    try {
        const juegos = yield prisma.juego.findMany({
            where: {
                AND: [
                    plataformaId && Number(plataformaId) !== 0
                        ? {
                            plataformas: {
                                some: { id: Number(plataformaId) },
                            },
                        }
                        : {},
                    categoriaId && Number(categoriaId) !== 0
                        ? { categoriaId: Number(categoriaId) }
                        : {},
                ],
            },
            include: {
                imagenes: true,
                plataformas: true,
            },
        });
        return res.status(200).json(juegos);
    }
    catch (error) {
        console.error('Error al obtener los juegos:', error);
        return res.status(500).json({ message: 'Error al obtener los juegos' });
    }
}));
// Ruta para agregar un nuevo juego
app.post('/api/juegos', authenticateToken, authorizeAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nombre, precio, estaOferta, estado, categoriaId, imagenes, videoUrl, plataformas } = req.body;
    const plataformaIds = plataformas;
    try {
        const nuevoJuego = yield prisma.juego.create({
            data: {
                nombre,
                precio,
                estaOferta,
                estado,
                categoriaId,
                imagenes: {
                    create: imagenes.map((imagen) => ({
                        url: imagen.url,
                        descripcion: imagen.descripcion,
                    }))
                },
                videoUrl,
                plataformas: {
                    connect: plataformaIds.map((plataformaId) => ({ id: plataformaId }))
                }
            }
        });
        return res.status(201).json(nuevoJuego);
    }
    catch (error) {
        console.error('Error al agregar juego:', error);
        return res.status(500).json({ message: 'Error al agregar el juego' });
    }
}));
// Ruta para editar un juego
app.put('/api/juegos/:id', authenticateToken, authorizeAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { nombre, precio, estaOferta, estado, categoriaId, imagenes, videoUrl, plataformas } = req.body;
    try {
        // Obtener el juego existente
        const juegoExistente = yield prisma.juego.findUnique({
            where: { id: parseInt(id) },
            include: { plataformas: true } // Incluir las plataformas actuales asociadas al juego
        });
        if (!juegoExistente) {
            return res.status(404).json({ message: 'Juego no encontrado' });
        }
        // Obtener las plataformas actuales del juego
        const plataformasExistentes = juegoExistente.plataformas.map(p => p.id);
        // Identificar plataformas que se deben eliminar
        const plataformasAEliminar = plataformasExistentes.filter(plataformaId => !plataformas.includes(plataformaId) // Identificar plataformas que no están en la nueva lista
        );
        // Identificar nuevas plataformas a conectar
        const plataformasAConectar = plataformas.filter((plataformaId) => !plataformasExistentes.includes(plataformaId) // Solo conectar las plataformas nuevas
        );
        const juegoEditado = yield prisma.juego.update({
            where: { id: parseInt(id) },
            data: {
                nombre,
                precio,
                estaOferta,
                estado,
                categoriaId,
                imagenes: {
                    deleteMany: {}, // Eliminar las imágenes anteriores
                    create: imagenes.map((imagen) => ({
                        url: imagen.url,
                        descripcion: imagen.descripcion
                    }))
                },
                videoUrl,
                plataformas: {
                    disconnect: plataformasAEliminar.map(id => ({ id })), // Eliminar las plataformas que ya no deben estar asociadas
                    connect: plataformasAConectar.map(id => ({ id })) // Conectar las nuevas plataformas
                }
            }
        });
        return res.status(200).json(juegoEditado); // Devuelve el juego editado
    }
    catch (error) {
        console.error('Error al editar el juego:', error);
        return res.status(500).json({ message: 'Error al editar el juego' });
    }
}));
// Ruta para eliminar un juego
app.delete('/api/juegos/:id', authenticateToken, authorizeAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        // Elimina imágenes relacionadas
        yield prisma.imagen.deleteMany({
            where: { juegoId: parseInt(id) }
        });
        // Desconecta plataformas relacionadas
        yield prisma.juego.update({
            where: { id: parseInt(id) },
            data: {
                plataformas: {
                    set: [] // Desconecta todas las plataformas
                }
            }
        });
        // Si tienes ventas relacionadas, elimina o maneja aquí
        // await prisma.venta.deleteMany({ where: { juegoId: parseInt(id) } });
        // Ahora elimina el juego
        yield prisma.juego.delete({
            where: { id: parseInt(id) }
        });
        return res.status(200).json({ message: 'Juego eliminado exitosamente' });
    }
    catch (error) {
        console.error('Error al eliminar el juego:', error);
        return res.status(500).json({ message: 'Error al eliminar el juego' });
    }
}));
// Ruta para obtener todas las categorías
app.get('/api/categorias', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const categorias = yield prisma.categoria.findMany();
    res.json(categorias);
}));
// Ruta para obtener todas las plataformas
app.get('/api/plataformas', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const plataformas = yield prisma.plataforma.findMany();
    res.json(plataformas);
}));
app.use("*", (req, res) => {
    res.status(404).json({ message: "Ruta no encontrada" });
});
app.use((err, req, res, next) => {
    console.error("Error no controlado:", err);
    res.status(500).json({ message: "Error interno del servidor" });
});
// Configurar el puerto y escuchar
const PORT = process.env.PORT || 3000; // Puedes configurar el puerto en el archivo .env
// Mostrar en la consola el puerto en el que está corriendo el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
//# sourceMappingURL=index.js.map