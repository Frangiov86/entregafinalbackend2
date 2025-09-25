Comision 76855

Proyecto de ecommerce Crud de usuarios+mejoramiento de arquitectura, órdenes de compra, ticket, funcionalidades de carrito, roles de usuario, dto y Dao y recuperación de contraseña mediante Token y correo electrónico enviado a casilla de usuario registrado.

¿Qué se hizo?

Se hizo un plan de mejora tomando como base la preentrega anterior.


Login por JWT (estrategia current), cookie httpOnly.

/current devuelve DTO (sin datos sensibles).

Repository Pattern separa negocio vs persistencia (DAOs).

Roles: admin (CRUD productos), user (carrito propio).

Password Reset: mail con link/btn, expira en 1h, bloquea repetir la contraseña anterior.

Compra: valida stock, genera Ticket, soporta compra parcial y ajusta carrito.

Se han generado dos handlebars. Uno es el que recibe el usuario en el correo electrónico para reseteo de contraseña y el segundo es la página formalmente en donde se puede resetear la contraseña linkeada desde el correo electrónico mediante un token de seguridad generado. Se puede probar de forma local con un correo real (previamente registrando un usuario de fantasia pero con un correo electrónico verdadero para probar la funcionalidad, sino hacerlo desde postman con la colección debidamente compartida en este proyecto)

Se agregaron comentarios a algunos js, para no perderse y evitar errores y como hoja de ruta para saber lo que hace cada línea de código.

Se usó:

Node

MongoDB Atlas o local

Postman / curl (este ultimo es excluyente, pero si se quiere usar Curl, tambíen se puede)

SMTP real (para mailing) o modo dev (solamente se envia un mail de soporte desde el servidor al correo original. Eso si funciona)

Variables de entorno (.env)

Detalle archivo env

PORT=8080
MONGO_URI="mongodb+srv://Admin:Whole_356@cluster0.zekbrev.mongodb.net/usuariosentrega1?retryWrites=true&w=majority&appName=Cluster0"
JWT_SECRET=secreto
SESSION_SECRET=secreto_sesiones
COOKIE_NAME=accessToken
COOKIE_SECURE=false
SAME_SITE=lax

# Habilitar registrar admin (solo dev)
ALLOW_ADMIN_REGISTER=true

# Mailing (Gmail u otro SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=pacodelacosta@gmail.com
SMTP_PASS=gtew zgrb qmbf lqsg
MAIL_FROM="pacodelacosta@gmail.com"

# Link público para el botón del mail
PUBLIC_BASE_URL=http://localhost:8080

# DEV: devolver token en /password/forgot
RETURN_RESET_TOKEN=true

DEBUG_CART_REPO=true


 Arquitectura y estructura del proyecto.

proyectousuarios/
├─ package.json
├─ README.md
├─ .env.example
└─ src/
   ├─ app.js                                 # App Express: middlewares, views (handlebars), routers, conexión Mongo
   │
   ├─ config/
   │  ├─ config.js                           # Centraliza variables de entorno (PORT, MONGO_URI, JWT, SMTP, etc.)
   │  └─ tokenpassport.js                    # Estrategia 'current' (JWT) + passportCall()
   │
   ├─ controllers/
   │  ├─ listarproductos.js                  # (NUEVO) GET /api/products/admin/all → lista TODOS los productos (solo admin)
   │  ├─ password.controller.js              # /api/password/forgot | /api/password/reset/:token | /api/password/debug/last-token
   │  ├─ carts.controller.js                 #  controladores de carrito
   │  ├─ products.controller.js              #  controladores de productos
   │  └─ purchase.controller.js              #  controlador de compra/ticket
   │
   ├─ routes/
   │  ├─ products.router.js                  # Público GET /, GET /:pid | Admin: POST/PUT/DELETE | + GET /admin/all (solo admin)
   │  ├─ carts.router.js                     # Rutas de carrito (crear propio, agregar/quitar/vaciar, ver detalles)
   │  ├─ purchase.router.js                  # POST /api/purchase/:cid/purchase → genera Ticket (compra completa/parcial)
   │  ├─ password.router.js                  # POST /forgot | GET /reset/:token (render) | POST /reset/:token (cambiar pass)
   │  ├─ sesionesdeusuario.js                # /api/sessions (register/login/current con DTO)
   │  ├─ validacionesusuarios.js             # /api/users (según tu proyecto)
   │  └─ mail.router.js                      # (Opcional) /api/mail pruebas SMTP
   │
   ├─ services/
   │  ├─ password.service.js                 # Lógica de recuperación: genera token (1h), arma link, envía mail, reinicia pass
   │  ├─ purchase.service.js                 # Lógica de compra: verifica stock, descuenta, genera Ticket, maneja parcial/completa
   │  ├─ product.service.js                  # Lógica de productos (si aplica)
   │  ├─ cart.service.js                     # Lógica de carritos (si aplica)
   │  └─ user.service.js                     # Lógica de usuarios (si aplica)
   │
   ├─ repositories/
   │  ├─ user.repository.js
   │  ├─ product.repository.js
   │  ├─ cart.repository.js
   │  ├─ ticket.repository.js
   │  └─ resetToken.repository.js
   │
   ├─ daos/
   │  ├─ factory.js                          # Exporta INSTANCIAS de DAOs (userDAO, productDAO, cartDAO, ticketDAO, resetTokenDAO)
   │  └─ mongo/
   │     ├─ user.dao.js
   │     ├─ product.dao.js
   │     ├─ cart.dao.js
   │     ├─ ticket.dao.js
   │     └─ resetToken.dao.js
   │
   ├─ models/
   │  ├─ User.js
   │  ├─ Product.js
   │  ├─ Cart.js
   │  ├─ Ticket.js
   │  └─ PasswordResetToken.js               # Índice TTL por expiresAt (token expira en 1h)
   │
   ├─ dtos/
   │  └─ usuarioCurrent.dto.js               # DTO de /current (nombreCompleto, email, rol, carritoId)
   │
   ├─ middlewares/
   │  ├─ rolesusuarios.js                    # requireRole('admin'|'user'), validación de dueño de carrito (si aplica)
   │  ├─ asyncHandler.js                     # Wrapper para controladores async sin try/catch repetidos
   │  └─ errorservidor.js                    # Handler centralizado de errores
   │
   ├─ utils/
   │  ├─ mailer.js                           # Nodemailer + Handlebars (envío de “reset-password”)
   │  └─ generadores.js                      # Generadores de códigos (ej. Ticket)
   │
   └─ views/
      ├─ auth/
      │  └─ paginadereseteo.handlebars       #  Página web por token (GET /api/password/reset/:token) + SweetAlert
      └─ mail/
         └─ reset-password.handlebars        #  Template de correo con botón “Restablecer contraseña”







