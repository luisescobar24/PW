import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '../prisma/generated/prisma';  // No cambiar esta importación
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';  // Para cargar variables de entorno

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
  console.log('Datos recibidos:', req.body);
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
  console.log('Datos recibidos:', req.body); // Verifica los datos que llegan del front-end

  const { nombre, password, correo, estado, rol = 'USER', extraField } = req.body;

  // Validación de los campos obligatorios
  if (!nombre || !password || !correo || typeof estado !== 'boolean') {
    return res.status(400).json({ message: 'Todos los campos son requeridos y estado debe ser un booleano' });
  }

  // Validar que la contraseña tenga al menos 6 caracteres
  if (password.length < 6) {
    return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
  }

  try {
    // Verificar si el correo ya está registrado
    const existingUserByEmail = await prisma.usuario.findUnique({
      where: { correo }, // Usamos correo como campo único
    });

    if (existingUserByEmail) {
      return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
    }

    // Verificar si el nombre (usuario) ya está registrado usando findFirst
    const existingUserByName = await prisma.usuario.findFirst({
      where: { nombre }, // Usamos findFirst para buscar por nombre
    });

    if (existingUserByName) {
      return res.status(400).json({ message: 'El nombre de usuario ya está registrado' });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const newUser = await prisma.usuario.create({
        data: {
          nombre,
          password: hashedPassword,
          correo,
          rol,
          estado,
          token: "",
        },
      });
      console.log('Usuario creado:', newUser);
      return res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        user: newUser,
      });
    } catch (error) {
      console.error('Error al registrar el usuario:', error);
      if ((error as any).code === 'P2002') {
        return res.status(400).json({ message: 'El correo ya está registrado' });
      }
      return res.status(500).json({ message: 'Error al registrar el usuario' });
    }
  } catch (error) {
    console.error('Error al registrar el usuario:', error);
    return res.status(500).json({ message: 'Error al registrar el usuario' });
  }
});

// Ruta para solicitar el código de verificación
app.post('/api/auth/forgot-password', async (req: Request, res: Response) => {
  const { correo } = req.body;

  if (!correo) {
    return res.status(400).json({ message: 'Correo es requerido' });
  }

  try {
    // Buscar al usuario por correo o nombre
    const user = await prisma.usuario.findFirst({
      where: {
        OR: [
          { correo },
          { nombre: correo }, // Buscar por nombre si es proporcionado
        ],
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Generar un código de verificación y su fecha de expiración en el payload del JWT
    const verificationCode = crypto.randomBytes(3).toString('hex');  // Código de 6 caracteres hexadecimales
    const verificationCodeExpiration = Date.now() + 3600000; // El código expira en 1 hora

    // Crear el token JWT con el código de verificación y la expiración
    const token = jwt.sign(
      { verificationCode, expiration: verificationCodeExpiration },
      process.env.JWT_SECRET!, // La clave secreta
      { expiresIn: '1h' } // Expira en 1 hora
    );

    // Imprimir el token y el código generado para depuración
    console.log('Token generado:', token);
    console.log('Código de verificación:', verificationCode);
    console.log('Expiración del código:', verificationCodeExpiration);

    // Almacenar el token en la base de datos (en el campo `token`)
    await prisma.usuario.update({
      where: { id: user.id },
      data: { token },
    });

    // Verificar que el token esté en la base de datos (opcional, para depuración)
    const updatedUser = await prisma.usuario.findUnique({
      where: { id: user.id },
      select: { token: true },
    });
    console.log('Token guardado en la base de datos:', updatedUser?.token);

    // Configurar el transporte de Nodemailer para enviar el código
    const transporter = nodemailer.createTransport({
      host: 'mail.smtp2go.com',
      port: 2525,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: '20214774@aloe.ulima.edu.pe', // Cambia a tu correo verificado
      to: user.correo,
      subject: 'Código de Verificación',
      text: `Tu código de verificación es: ${verificationCode}. Este código expira en 1 hora.`,
    };

    // Enviar el correo de verificación
    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: 'Se ha enviado el código de verificación al correo' });
  } catch (error) {
    console.error('Error al enviar el código de verificación:', error);
    return res.status(500).json({ message: 'Error al enviar el código de verificación' });
  }
});

// Ruta para obtener un juego específico with sus imágenes
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

// Ruta para cambiar la contraseña después de verificar el código
app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
  const { correo, verificationCode, newPassword, confirmNewPassword } = req.body;

  if (!correo || !newPassword || !confirmNewPassword || !verificationCode) {
    return res.status(400).json({ message: 'Correo, código y nuevas contraseñas son requeridos' });
  }

  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({ message: 'Las contraseñas no coinciden' });
  }

  try {
    // Buscar al usuario por correo
    const user = await prisma.usuario.findFirst({
      where: { correo },
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar si el token de verificación existe y es válido
    if (!user.token || typeof user.token !== 'string') {
      console.log('El usuario no tiene un token válido');
      return res.status(400).json({ message: 'El código de verificación es inválido o ha expirado' });
    }

    let decodedToken: any;
    try {
      decodedToken = jwt.verify(user.token, process.env.JWT_SECRET!);
    } catch (err) {
      console.log('Error al verificar el token:', err);
      return res.status(400).json({ message: 'El código de verificación es inválido o ha expirado' });
    }

    // Imprimir el token decodificado para depuración
    console.log('Token decodificado:', decodedToken);

    // Verificar si el código de verificación es correcto y no ha expirado
    if (decodedToken.verificationCode !== verificationCode) {
      console.log('Código de verificación incorrecto:', decodedToken.verificationCode, verificationCode);
      return res.status(400).json({ message: 'Código de verificación incorrecto' });
    }

    if (decodedToken.expiration < Date.now()) {
      console.log('El código de verificación ha expirado. Expiración:', decodedToken.expiration, 'Actual:', Date.now());
      return res.status(400).json({ message: 'El código de verificación ha expirado' });
    }

    // Encriptar la nueva contraseña
    console.log('Encriptando la nueva contraseña');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar la contraseña en la base de datos
    await prisma.usuario.update({
      where: { id: user.id },
      data: { password: hashedPassword, token: '' }, // Limpiar el campo token después del cambio
    });

    console.log('Contraseña actualizada con éxito para el usuario:', correo);
    return res.status(200).json({ message: 'Contraseña actualizada con éxito' });
  } catch (error) {
    console.error('Error al actualizar la contraseña:', error);
    return res.status(500).json({ message: 'Error al actualizar la contraseña' });
  }
});
 
// Ruta para registrar ventas
app.post('/api/ventas', async (req: Request, res: Response) => {
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

// Ruta para agregar un nuevo juego (sin token requerido)
app.post('/api/juegos', async (req: Request, res: Response) => {
  const { nombre, precio, estaOferta, estado, categoriaId, imagenes, videoUrl, plataformas } = req.body;

  try {
    const nuevoJuego = await prisma.juego.create({
      data: {
        nombre,
        precio,
        estaOferta,
        estado,
        categoriaId,
        imagenes: {
          create: imagenes.map((imagen: { url: string, descripcion: string }) => ({
            url: imagen.url,
            descripcion: imagen.descripcion,
          }))
        },
        videoUrl,
        plataformas: {
          connect: plataformas.map((plataformaId: number) => ({ id: plataformaId }))
        }
      }
    });

    return res.status(201).json(nuevoJuego);
  } catch (error) {
    console.error('Error al agregar juego:', error);
    return res.status(500).json({ message: 'Error al agregar el juego' });
  }
});

// Ruta para editar un juego (sin token requerido)
app.put('/api/juegos/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nombre, precio, estaOferta, estado, categoriaId, imagenes, videoUrl, plataformas } = req.body;

  try {
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
          disconnect: [],
          connect: plataformas.map((plataformaId: number) => ({ id: plataformaId }))
        }
      }
    });

    return res.status(200).json(juegoEditado);
  } catch (error) {
    console.error('Error al editar el juego:', error);
    return res.status(500).json({ message: 'Error al editar el juego' });
  }
});

// Ruta para eliminar un juego (sin token requerido)
app.delete('/api/juegos/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.imagen.deleteMany({
      where: { juegoId: parseInt(id) }
    });

    await prisma.juego.update({
      where: { id: parseInt(id) },
      data: {
        plataformas: {
          set: []
        }
      }
    });

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

// Ruta para realizar una prueba de envío de correo
app.post('/api/test-send-email', async (req: Request, res: Response) => {
  const { correoDestino, asunto, contenido } = req.body;

  if (!correoDestino || !asunto || !contenido) {
    return res.status(400).json({ message: 'Correo destino, asunto y contenido son requeridos' });
  }

  try {
    // Configurar el transporte con SMTP2Go
    const transporter = nodemailer.createTransport({
      host: 'mail.smtp2go.com',
      port: 2525, // Puedes usar 2525, 587 o 8025
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Configurar los detalles del correo
    const mailOptions = {
      from: '20214774@aloe.ulima.edu.pe',
      to: correoDestino,
      subject: asunto,
      text: contenido,
    };

    // Enviar el correo
    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: 'Correo enviado con éxito' });
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    return res.status(500).json({ message: 'Error al enviar el correo' });
  }
});

// Ruta para verificar el código de verificación
app.post('/api/auth/verify-code', async (req: Request, res: Response) => {
  const { correo, verificationCode } = req.body;

  if (!correo || !verificationCode) {
    return res.status(400).json({ message: 'Correo y código de verificación son requeridos' });
  }

  console.log('Datos recibidos para validar el código:', { correo, verificationCode });

  try {
    // Buscar al usuario por correo
    const user = await prisma.usuario.findFirst({
      where: { correo },
    });

    if (!user) {
      console.log('Usuario no encontrado:', correo);
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar si el token existe
    if (!user.token) {
      console.log('El usuario no tiene un token');
      return res.status(400).json({ message: 'El código de verificación es inválido o ha expirado' });
    }

    let decodedToken: any;
    try {
      decodedToken = jwt.verify(user.token, process.env.JWT_SECRET!);
    } catch (err) {
      console.log('Error al verificar el token:', err);
      return res.status(400).json({ message: 'El código de verificación es inválido o ha expirado' });
    }

    // Imprimir el token decodificado para depuración
    console.log('Token decodificado:', decodedToken);

    // Verificar si el código de verificación es correcto y no ha expirado
    if (decodedToken.verificationCode !== verificationCode) {
      console.log('Código de verificación incorrecto:', decodedToken.verificationCode, verificationCode);
      return res.status(400).json({ message: 'Código de verificación incorrecto' });
    }

    if (decodedToken.expiration < Date.now()) {
      console.log('El código de verificación ha expirado. Expiración:', decodedToken.expiration, 'Actual:', Date.now());
      return res.status(400).json({ message: 'El código de verificación ha expirado' });
    }

    return res.status(200).json({ message: 'Código de verificación válido' });
  } catch (error) {
    console.error('Error al verificar el código:', error);
    return res.status(500).json({ message: 'Error al verificar el código de verificación' });
  }
});

// Configurar el puerto y escuchar
const PORT = process.env.PORT || 3000;  // Puedes configurar el puerto en el archivo .env

// Mostrar en la consola el puerto en el que está corriendo el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

// Implementación básica de CORS middleware
function cors(options: {
  origin: string;
  methods: string[];
  allowedHeaders: string[];
}): express.RequestHandler {
  return (req, res, next) => {
    res.header('Access-Control-Allow-Origin', options.origin);
    res.header('Access-Control-Allow-Methods', options.methods.join(','));
    res.header('Access-Control-Allow-Headers', options.allowedHeaders.join(','));
    // Permitir credenciales si es necesario:
    // res.header('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  };
}

