import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import path from 'path';
import { fileURLToPath } from 'url';
import { engine } from 'express-handlebars';

import { PORT, MONGO_URI, SESSION_SECRET, COOKIE_SECURE, SAME_SITE, PUBLIC_BASE_URL } from './config/config.js';
import passport, { inicializarPassport } from './config/tokenpassport.js';
import usersRouter from './routes/validacionesusuarios.js';
import sessionsRouter from './routes/sesionesdeusuario.js';
import { errorHandler } from './middlewares/errorservidor.js';

// Routers de negocio
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import purchaseRouter from './routes/purchase.router.js';
import passwordRouter from './routes/password.router.js';

// Ruta de test de mail (opcional)
import mailRouter from './routes/mail.router.js';
import { verificarSMTP } from './utils/mailer.js';

// __dirname helpers (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ App
const app = express();

// app.set('trust proxy', 1); // si desplegás detrás de proxy/https

// 🔧 View engine (Handlebars): aceptamos .handlebars y .hbs
app.engine('handlebars', engine({ extname: '.handlebars', defaultLayout: false }));
app.engine('hbs',        engine({ extname: '.hbs',         defaultLayout: false }));
app.set('view engine', 'handlebars'); // por default usamos .handlebars
app.set('views', path.join(__dirname, 'views'));

// Middlewares base
app.use(cors({
  // En prod, poné la URL de tu front en lugar de true
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Sesiones persistentes
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: MONGO_URI,
    ttl: 60 * 60 * 24 * 7 // 7 días
  }),
  cookie: {
    httpOnly: true,
    secure: COOKIE_SECURE === 'true',
    sameSite: SAME_SITE, // 'lax' | 'strict' | 'none'
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}));

// Passport (estrategia 'current')
inicializarPassport();
app.use(passport.initialize());
// app.use(passport.session()); // no hace falta para JWT

// (Opcional) Verificar SMTP al arrancar
verificarSMTP(); // imprime [MAILER] Conexión SMTP OK o el error

// Rutas existentes
app.use('/api/users', usersRouter);
app.use('/api/sessions', sessionsRouter);

// Rutas nuevas
app.use('/api/products', productsRouter);   // público GET /, GET /:id ; admin POST/PUT/DELETE
app.use('/api/carts', cartsRouter);         // user agrega productos al carrito
app.use('/api/purchase', purchaseRouter);   // user checkout -> ticket
app.use('/api/password', passwordRouter);   // forgot/reset password

// Ruta de test de mail (podés comentar esto en prod)
app.use('/api/mail', mailRouter);

// (Opcional) Home mínimo para evitar 404 en "/"
app.get('/', (_req, res) => {
  res.status(200).send(`OK - Backend en marcha. Base pública: ${PUBLIC_BASE_URL || 'http://localhost:' + PORT}`);
});

// Handler de errores al final
app.use(errorHandler);

// Conexión y listen
mongoose.connect(MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`Servidor listo: http://localhost:${PORT}`)))
  .catch(err => console.error('Error conectando a Mongo:', err));
