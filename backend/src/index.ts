import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '../prisma/generated/prisma';  // No cambiar esta importación
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';  // Para cargar variables de entorno
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import cors from 'cors';

dotenv.config();  // Cargar las variables de entorno desde .env

const app = express();
const prisma = new PrismaClient();  // Inicializando el cliente de Prisma

app.use(cors({
  origin: 'http://localhost:5173',  // Solo permitir solicitudes desde este origen
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'], // Agrega los encabezados que deseas permitir
}));

// Middleware para parsear el cuerpo de las peticiones como JSON
app.use(express.json());

interface AuthRequest extends Request {
  user?: any;
}

function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token requerido' });
  }
  jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }
    req.user = decoded as any;
    next();
  });
}

function authorizeAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user && req.user.rol === 'ADMIN') {
    return next();
  }
  return res.status(403).json({ message: 'Acceso denegado' });
}

// Ruta para obtener todos los usuarios
app.get('/api/usuarios', async (req: Request, res: Response) => {
  try {
    const usuarios = await prisma.usuario.findMany({
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

    return res.status(200).json(usuarios);  // Devolver la lista de usuarios
  } catch (error) {
    console.error('Error al obtener los usuarios:', error);
    return res.status(500).json({ message: 'Error al obtener los usuarios' });
  }
});

// Ruta para iniciar sesión (Login)
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { correo, password } = req.body;

  if (!correo || !password) {
    return res.status(400).json({ message: 'Correo y contraseña son requeridos' });
  }

  try {
    // Buscar el usuario por correo o nombre utilizando findFirst
    const user = await prisma.usuario.findFirst({
      where: {
        OR: [
          { correo: correo },  // Buscar por correo
          { nombre: correo }    // Buscar por nombre (usuario)
        ]
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Comparar la contraseña ingresada con la almacenada
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // Verificar si el usuario está suspendido (estado === false)
    if (user.estado === false) {
      return res.status(403).json({ message: 'Cuenta suspendida' });
    }

    // Generar un token JWT con el rol del usuario
    const token = jwt.sign({ userId: user.id, estado: user.estado, rol: user.rol }, process.env.JWT_SECRET!, { expiresIn: '1h' });

    return res.status(200).json({
      success: true,
      message: 'Login exitoso',
      user: { id: user.id, nombre: user.nombre, correo: user.correo, rol: user.rol },
      token,
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    return res.status(500).json({ message: 'Error al iniciar sesión' });
  }
});

app.post('/api/auth/signup', async (req: Request, res: Response) => {
  console.log('Datos recibidos:', req.body);  // Verifica los datos que llegan del front-end

  const { nombre, password, correo, estado, rol = 'USER', extraField } = req.body;

  // Validación de los campos obligatorios
  if (!nombre || !password || !correo || typeof estado !== 'boolean') {
    return res.status(400).json({ message: 'Todos los campos son requeridos y estado debe ser un booleano' });
  }

  // Validar el formato del correo
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(correo)) {
    return res.status(400).json({ message: 'Correo no válido' });
  }

  // Validar que la contraseña tenga al menos 6 caracteres
  if (password.length < 6) {
    return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
  }

  try {
    // Verificar si el correo ya está registrado
    const existingUserByEmail = await prisma.usuario.findUnique({
      where: { correo },  // Usamos correo como campo único
    });

    if (existingUserByEmail) {
      return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
    }

    // Verificar si el nombre (usuario) ya está registrado usando findFirst
    const existingUserByName = await prisma.usuario.findFirst({
      where: { nombre },  // Usamos findFirst para buscar por nombre
    });

    if (existingUserByName) {
      return res.status(400).json({ message: 'El nombre de usuario ya está registrado' });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el nuevo usuario
    const newUser = await prisma.usuario.create({
      data: {
        nombre,
        password: hashedPassword,
        correo,
        rol,
        estado,
        token: "", // El token puede ser vacío por ahora
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: newUser,
    });
  } catch (error) {
    console.error('Error al registrar el usuario:', error);
    return res.status(500).json({ message: 'Error al registrar el usuario' });
  }
});

// Ruta para solicitar el restablecimiento de la contraseña (Forgot Password)
app.post('/api/auth/forgot-password', async (req: Request, res: Response) => {
  const { correo } = req.body;

  if (!correo) {
    return res.status(400).json({ message: 'Correo es requerido' });
  }

  try {
    const user = await prisma.usuario.findUnique({
      where: { correo },
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Crear un token de restablecimiento de contraseña (expira en 1 hora)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiration = Date.now() + 3600000; // 1 hora

    // Configurar el transporte de Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Tu correo electrónico
        pass: process.env.EMAIL_PASS, // Tu contraseña de correo
      },
    });

    // Enviar el correo de restablecimiento
    const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: 'no-reply@game-store.com',
      to: correo,
      subject: 'Restablecimiento de Contraseña',
      html: `
        <h3>Solicitud de restablecimiento de contraseña</h3>
        <p>Para restablecer tu contraseña, haz clic en el siguiente enlace:</p>
        <a href="${resetUrl}">Restablecer mi contraseña</a>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: 'Se ha enviado un enlace de restablecimiento al correo' });
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    return res.status(500).json({ message: 'Error al procesar la solicitud de restablecimiento' });
  }
});

// Ruta para obtener un juego específico con sus imágenes
app.get('/api/juegos/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const juego = await prisma.juego.findUnique({
      where: { id: Number(id) },
      include: {
        imagenes: true,
        plataformas: true, // <-- Agrega esto para incluir plataformas
      },
    });

    if (!juego) {
      return res.status(404).json({ message: 'Juego no encontrado' });
    }

    return res.status(200).json(juego);
  } catch (error) {
    console.error('Error al obtener el juego:', error);
    return res.status(500).json({ message: 'Error al obtener el juego' });
  }
});

// Ruta para restablecer la contraseña (Reset Password)
app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
  const { correo, newPassword, confirmNewPassword } = req.body;

  if (!correo || !newPassword || !confirmNewPassword) {
    return res.status(400).json({ message: 'Correo y nuevas contraseñas son requeridos' });
  }

  // Verificar si las contraseñas coinciden
  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({ message: 'Las contraseñas no coinciden' });
  }

  try {
    // Buscar el usuario por correo o nombre
    const user = await prisma.usuario.findFirst({
      where: {
        OR: [
          { correo: correo },  // Buscar por correo
          { nombre: correo },   // Buscar por nombre (usuario)
        ],
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Encriptar la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar la contraseña en la base de datos
    await prisma.usuario.update({
      where: { id: user.id },  // Actualizamos el usuario por su ID
      data: {
        password: hashedPassword,
      },
    });

    return res.status(200).json({ message: 'Contraseña actualizada con éxito' });
  } catch (error) {
    console.error('Error al actualizar la contraseña:', error);
    return res.status(500).json({ message: 'Error al actualizar la contraseña' });
  }
});

// Ruta para registrar ventas
app.post('/api/ventas', authenticateToken, authorizeAdmin, async (req: Request, res: Response) => {
  const { ventas } = req.body;

  if (!ventas || !Array.isArray(ventas) || ventas.length === 0) {
    return res.status(400).json({ message: 'No hay ventas para registrar' });
  }

  try {
    // Inicia una transacción para registrar todas las ventas
    const result = await prisma.$transaction(
      ventas.map((venta: any) =>
        prisma.venta.create({
          data: {
            fecha: venta.fecha,
            usuarioId: venta.usuarioid,  // Suponiendo que el usuario está autenticado y su id está presente
            juegoId: venta.juegoid,
            codigo: crypto.randomBytes(16).toString('hex'),  // Generar un código único para la venta
            montoPagado: venta.monto_pagado,
            // No necesitamos "cantidad" aquí, ya que es una propiedad en el frontend
          }
        })
      )
    );

    // Si la transacción fue exitosa
    return res.status(201).json({ message: 'Ventas registradas correctamente', result });
  } catch (error) {
    console.error('Error al registrar ventas:', error);
    return res.status(500).json({ message: 'Error al registrar ventas' });
  }
});

// Ruta para obtener todos los juegos
app.get('/api/juegos', async (req, res) => {
  const { plataformaId, categoriaId } = req.query;  // Recibe los IDs como parámetros

  try {
    const juegos = await prisma.juego.findMany({
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
  } catch (error) {
    console.error('Error al obtener los juegos:', error);
    return res.status(500).json({ message: 'Error al obtener los juegos' });
  }
});

// Ruta para agregar un nuevo juego
app.post('/api/juegos', authenticateToken, authorizeAdmin, async (req: Request, res: Response) => {
  const { nombre, precio, estaOferta, estado, categoriaId, imagenes, videoUrl, plataformas } = req.body;

  interface Imagen {
    url: string;
    descripcion: string;
  }

  const plataformaIds: number[] = plataformas;

  try {
    const nuevoJuego = await prisma.juego.create({
      data: {
        nombre,
        precio,
        estaOferta,
        estado,
        categoriaId,
        imagenes: {
          create: imagenes.map((imagen: Imagen) => ({
            url: imagen.url,
            descripcion: imagen.descripcion,
          }))
        },
        videoUrl,
        plataformas: {
          connect: plataformaIds.map((plataformaId: number) => ({ id: plataformaId }))
        }
      }
    });

    return res.status(201).json(nuevoJuego);
  } catch (error) {
    console.error('Error al agregar juego:', error);
    return res.status(500).json({ message: 'Error al agregar el juego' });
  }
});

// Ruta para editar un juego
app.put('/api/juegos/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  const { id } = req.params;
  const { nombre, precio, estaOferta, estado, categoriaId, imagenes, videoUrl, plataformas } = req.body;

  try {
    // Obtener el juego existente
    const juegoExistente = await prisma.juego.findUnique({
      where: { id: parseInt(id) },
      include: { plataformas: true } // Incluir las plataformas actuales asociadas al juego
    });

    if (!juegoExistente) {
      return res.status(404).json({ message: 'Juego no encontrado' });
    }

    // Obtener las plataformas actuales del juego
    const plataformasExistentes = juegoExistente.plataformas.map(p => p.id);

    // Identificar plataformas que se deben eliminar
    const plataformasAEliminar = plataformasExistentes.filter(
      plataformaId => !plataformas.includes(plataformaId)  // Identificar plataformas que no están en la nueva lista
    );

    // Identificar nuevas plataformas a conectar
    const plataformasAConectar: number[] = (plataformas as number[]).filter(
      (plataformaId: number) => !plataformasExistentes.includes(plataformaId)  // Solo conectar las plataformas nuevas
    );

    const juegoEditado = await prisma.juego.update({
      where: { id: parseInt(id) },
      data: {
        nombre,
        precio,
        estaOferta,
        estado,
        categoriaId,
        imagenes: {
          deleteMany: {}, // Eliminar las imágenes anteriores
          create: imagenes.map((imagen: { url: string, descripcion: string }) => ({
            url: imagen.url,
            descripcion: imagen.descripcion
          }))
        },
        videoUrl,
        plataformas: {
          disconnect: plataformasAEliminar.map(id => ({ id })), // Eliminar las plataformas que ya no deben estar asociadas
          connect: plataformasAConectar.map(id => ({ id }))  // Conectar las nuevas plataformas
        }
      }
    });

    return res.status(200).json(juegoEditado);  // Devuelve el juego editado
  } catch (error) {
    console.error('Error al editar el juego:', error);
    return res.status(500).json({ message: 'Error al editar el juego' });
  }
});

// Ruta para eliminar un juego
app.delete('/api/juegos/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    // Elimina imágenes relacionadas
    await prisma.imagen.deleteMany({
      where: { juegoId: parseInt(id) }
    });

    // Desconecta plataformas relacionadas
    await prisma.juego.update({
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
    await prisma.juego.delete({
      where: { id: parseInt(id) }
    });

    return res.status(200).json({ message: 'Juego eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar el juego:', error);
    return res.status(500).json({ message: 'Error al eliminar el juego' });
  }
});

// Ruta para obtener todas las categorías
app.get('/api/categorias', async (req, res) => {
  const categorias = await prisma.categoria.findMany();
  res.json(categorias);
});

// Ruta para obtener todas las plataformas
app.get('/api/plataformas', async (req, res) => {
  const plataformas = await prisma.plataforma.findMany();
  res.json(plataformas);
});

// Configurar el puerto y escuchar
const PORT = process.env.PORT || 3000;  // Puedes configurar el puerto en el archivo .env

// Mostrar en la consola el puerto en el que está corriendo el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
