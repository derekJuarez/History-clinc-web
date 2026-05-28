# 📚 Guía Completa del Backend — Clínica Odontológica

> **Stack:** Node.js · Express 5 · MySQL2 · Zod · JWT · Morgan · Helmet

---

## 1. ¿Qué arquitectura usa este proyecto?

El backend sigue el patrón **MVC (Model - View - Controller)** organizado en capas. En este caso no hay "View" porque el backend solo devuelve JSON; la vista la maneja el Frontend en HTML/CSS/JS.

Cada capa tiene **una sola responsabilidad**:

| Capa | Carpeta | Responsabilidad |
|---|---|---|
| Entry Point | `server.js` | Arrancar el servidor |
| App Config | `app.js` | Middlewares globales y registro de rutas |
| Config | `config/` | Conexión a la base de datos |
| Routes | `routes/` | Definir URLs y métodos HTTP |
| Middlewares | `middlewares/` | Filtros que corren antes del controller |
| Schemas | `schemas/` | Reglas de validación de datos (Zod) |
| Controllers | `controllers/` | Lógica del negocio |
| Models | `models/` | Consultas SQL a la base de datos |
| Utils | `utils/` | Funciones de ayuda reutilizables |

---

## 2. Flujo de una Petición HTTP

Cada vez que el Frontend hace una petición (por ejemplo un login), recorre este camino **de arriba hacia abajo**:

```
[Frontend]
    │
    │  POST /api/auth/login  { email, password }
    ▼
[routes/auth.routes.js]
    │  Define: "Este endpoint existe y acepta POST"
    │
    ▼
[middlewares/auth.middleware.js]  ← validateSchema(loginSchema)
    │  Verifica que el body tenga email válido y password >= 6 chars
    │  Si falla → responde 400 Bad Request (nunca llega al controller)
    │
    ▼
[controllers/auth.controller.js]  ← login()
    │  Lógica: busca al usuario, verifica contraseña, prepara respuesta
    │
    ▼
[models/user.model.js]  ← findUserByEmail()
    │  Ejecuta: SELECT * FROM users WHERE email = ?
    │
    ▼
[config/db.js]  ← MySQL Pool
    │  Conexión real a la base de datos clinica_odontologia
    │
    ▼
[utils/helpers.util.js]  ← successResponse() / errorResponse()
    │  Formatea la respuesta JSON de manera estándar
    │
    ▼
[Frontend]
    Recibe: { success: true, message: "...", data: { id, email } }
```

---

## 3. Descripción Detallada de Cada Archivo

### 📄 `server.js` — Punto de entrada

```js
import app from './app.js';
import './config/db.js'; // Dispara la conexión a MySQL

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => { ... });
```

**Responsabilidad:** Solo arrancar el servidor.  
**Regla:** No pongas lógica de rutas ni middlewares aquí. Si quieres cambiar el puerto, edita la variable `PORT`.

---

### 📄 `app.js` — Configuración de Express

```js
app.use(cors());           // Permite peticiones del Frontend (otros orígenes)
app.use(helmet(...));      // Agrega cabeceras de seguridad HTTP
app.use(morgan('dev'));    // Muestra en consola cada petición recibida
app.use(express.json());   // Permite recibir datos JSON en el body

app.use('/api/auth', authRoutes);  // Registra las rutas de autenticación
```

**Responsabilidad:** Configurar Express y registrar grupos de rutas.  
**Regla:** Cada vez que crees un nuevo archivo de rutas, lo importas y registras aquí:
```js
import pacienteRoutes from './routes/paciente.routes.js';
app.use('/api/pacientes', pacienteRoutes);
```

---

### 📄 `config/db.js` — Conexión a MySQL

```js
const connection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'clinica_odontologia',
    connectionLimit: 10,   // Máximo 10 conexiones simultáneas
});
```

**¿Qué es un Pool?** En lugar de abrir y cerrar una conexión con cada petición, el pool mantiene un conjunto de conexiones listas para reutilizar. Es más eficiente.

**Para usarlo en cualquier modelo:**
```js
import db from '../config/db.js';
const [rows] = await db.query('SELECT * FROM tabla');
```

> [!IMPORTANT]
> Necesitas tener **XAMPP corriendo** con Apache y MySQL activos antes de iniciar el servidor. La base de datos debe llamarse `clinica_odontologia`.

---

### 📄 `routes/auth.routes.js` — Definición de URLs

```js
router.post('/login', validateSchema(loginSchema), login);
//           URL        Middleware (valida)          Controller (lógica)
```

**Responsabilidad:** Mapear URLs a sus handlers.  
**Formato:** `router.MÉTODO('/ruta', ...middlewares, controller)`

**Métodos HTTP más comunes:**
| Método | Uso |
|---|---|
| `GET` | Obtener datos |
| `POST` | Crear un recurso nuevo |
| `PUT` | Reemplazar un recurso completo |
| `PATCH` | Modificar campos específicos |
| `DELETE` | Eliminar un recurso |

**Ejemplo de ruta protegida** (requiere que el usuario esté logueado):
```js
import { verifyToken } from '../middlewares/auth.middleware.js';

router.get('/perfil', verifyToken, getPerfil);
//                    ↑ Verifica JWT antes de ejecutar el controller
```

---

### 📄 `middlewares/auth.middleware.js` — Filtros

Tienes dos middlewares listos para usar:

#### `validateSchema(schema)` — Validación de datos con Zod
```js
export const validateSchema = (schema) => (req, res, next) => {
    schema.parse({ body: req.body, query: req.query, params: req.params });
    next(); // Si pasa, continúa al controller
    // Si falla, responde 400 automáticamente
};
```
**¿Cuándo usarlo?** Siempre que una ruta reciba datos del cliente (body, query params, URL params).

#### `verifyToken` — Protección con JWT
```js
export const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']; // "Bearer eyJhbGci..."
    const decoded = jwt.verify(tokenString, 'TU_SECRETO');
    req.user = decoded; // El controller puede acceder a req.user
    next();
};
```
**¿Cuándo usarlo?** En rutas que solo deben ser accesibles por usuarios autenticados (historiales clínicos, panel de maestro, etc.).

---

### 📄 `schemas/auth.schema.js` — Validación con Zod

```js
export const loginSchema = z.object({
    body: z.object({
        email: z.string().email('Debe ser un correo electrónico válido'),
        password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
    })
});
```

**Zod** valida y lanza un error descriptivo si los datos no cumplen las reglas. El middleware lo captura y responde `400` con el mensaje de error.

**Tipos de validación útiles en Zod:**
```js
z.string()              // Texto
z.string().email()      // Email válido
z.string().min(n)       // Mínimo n caracteres
z.string().max(n)       // Máximo n caracteres
z.number()              // Número
z.number().int()        // Número entero
z.number().positive()   // Número positivo
z.boolean()             // true o false
z.enum(['a', 'b', 'c']) // Valor de una lista
z.optional()            // Campo no obligatorio
```

**Ejemplo para crear un paciente:**
```js
// schemas/paciente.schema.js
import { z } from 'zod';

export const createPacienteSchema = z.object({
    body: z.object({
        nombre: z.string().min(2, 'El nombre es obligatorio'),
        apellido: z.string().min(2, 'El apellido es obligatorio'),
        fecha_nacimiento: z.string().date('Fecha inválida'),
        email: z.string().email().optional(),
    })
});
```

---

### 📄 `controllers/auth.controller.js` — Lógica del Negocio

```js
export const login = async (req, res) => {
    const { email, password } = req.body;   // 1. Extraer datos del body
    const user = await findUserByEmail(email); // 2. Consultar al model
    
    if (!user) return errorResponse(res, 404, 'Usuario no encontrado'); // 3. Validar resultado
    if (password !== user.password) return errorResponse(res, 401, 'Contraseña incorrecta');

    return successResponse(res, 200, 'Inicio de sesión exitoso', { id: user.id }); // 4. Responder
};
```

**Responsabilidades del controller:**
1. Extraer datos de `req.body`, `req.params`, `req.query`
2. Llamar funciones del Model
3. Aplicar lógica de negocio (validar estados, permisos, etc.)
4. Responder usando `successResponse` o `errorResponse`

**Regla importante:** El controller **nunca escribe SQL**. Solo llama funciones del Model.

---

### 📄 `models/user.model.js` — Consultas SQL

```js
export const findUserByEmail = async (email) => {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0]; // Retorna el primer resultado o undefined
};
```

**¿Por qué `[rows]`?** `mysql2` devuelve un array de dos elementos: `[filas, metadata]`. Con destructuring tomamos solo las filas.

**¿Por qué `rows[0]`?** Porque al buscar por email esperamos un solo usuario. Si usas `SELECT` en general, retornas `rows` completo (todo el array).

**Ejemplos de consultas comunes:**
```js
// Obtener todos
const [rows] = await db.query('SELECT * FROM pacientes');
return rows;

// Obtener uno por ID
const [rows] = await db.query('SELECT * FROM pacientes WHERE id = ?', [id]);
return rows[0];

// Insertar
const [result] = await db.query('INSERT INTO pacientes SET ?', [datosPaciente]);
return result.insertId; // ID del registro creado

// Actualizar
await db.query('UPDATE pacientes SET nombre = ? WHERE id = ?', [nombre, id]);

// Eliminar
await db.query('DELETE FROM pacientes WHERE id = ?', [id]);
```

---

### 📄 `utils/helpers.util.js` — Respuestas Estandarizadas

```js
// Respuesta exitosa
successResponse(res, 200, 'Mensaje', { dato: 'valor' });
// → { success: true, message: "Mensaje", data: { dato: "valor" } }

// Respuesta de error
errorResponse(res, 404, 'No encontrado');
// → { success: false, message: "No encontrado" }
```

**Códigos HTTP más usados:**
| Código | Significado | Cuándo usarlo |
|---|---|---|
| `200` | OK | Petición exitosa (GET, PUT, PATCH) |
| `201` | Created | Recurso creado (POST) |
| `400` | Bad Request | Datos inválidos del cliente |
| `401` | Unauthorized | No autenticado (sin token o token malo) |
| `403` | Forbidden | Autenticado pero sin permisos |
| `404` | Not Found | El recurso no existe |
| `500` | Server Error | Error inesperado en el servidor |

---

## 4. Receta: Cómo Crear un Nuevo Endpoint

Supón que quieres crear `POST /api/pacientes` para registrar un paciente nuevo.  
Siempre sigue estos **5 pasos en orden**:

### Paso 1 — Schema (`schemas/paciente.schema.js`)
```js
import { z } from 'zod';
export const createPacienteSchema = z.object({
    body: z.object({
        nombre: z.string().min(2),
        email: z.string().email().optional(),
    })
});
```

### Paso 2 — Model (`models/paciente.model.js`)
```js
import db from '../config/db.js';
export const createPaciente = async (data) => {
    const [result] = await db.query('INSERT INTO pacientes SET ?', [data]);
    return result.insertId;
};
```

### Paso 3 — Controller (`controllers/paciente.controller.js`)
```js
import { createPaciente } from '../models/paciente.model.js';
import { successResponse, errorResponse } from '../utils/helpers.util.js';

export const registrarPaciente = async (req, res) => {
    try {
        const id = await createPaciente(req.body);
        return successResponse(res, 201, 'Paciente creado', { id });
    } catch (error) {
        return errorResponse(res, 500, 'Error al crear paciente');
    }
};
```

### Paso 4 — Route (`routes/paciente.routes.js`)
```js
import { Router } from 'express';
import { registrarPaciente } from '../controllers/paciente.controller.js';
import { validateSchema } from '../middlewares/auth.middleware.js';
import { createPacienteSchema } from '../schemas/paciente.schema.js';

const router = Router();
router.post('/', validateSchema(createPacienteSchema), registrarPaciente);
export default router;
```

### Paso 5 — Registrar en `app.js`
```js
import pacienteRoutes from './routes/paciente.routes.js';
app.use('/api/pacientes', pacienteRoutes);
```

✅ Endpoint listo en: `POST http://localhost:3001/api/pacientes`

---

## 5. Cómo Levantar el Servidor

```powershell
# 1. Asegúrate de que XAMPP está corriendo (Apache + MySQL)
# 2. Desde la raíz del proyecto:

node backend/server.js

# O con recarga automática al guardar cambios:
npx nodemon backend/server.js
```

El servidor corre en: **`http://localhost:3001`**

Puedes probar un endpoint con esta URL en el navegador:
```
http://localhost:3001/api/login
```
Debería responder: `{ "message": "Bienvenido a la API de Clínica Odontológica" }`

---

## 6. ⚠️ Cosas Pendientes (Importante para Producción)

> [!WARNING]
> Los siguientes puntos son **vulnerabilidades de seguridad** que deben resolverse antes de usar el sistema con datos reales.

### 1. JWT Secret hardcodeado
**Problema:** El secreto para firmar tokens está escrito directamente en el código.
```js
// ❌ Así está ahora (inseguro):
jwt.verify(tokenString, 'TU_SECRETO_AQUI');
```
**Solución:** Crear un archivo `.env` en la raíz:
```
JWT_SECRET=una_cadena_muy_larga_y_aleatoria_aqui
DB_PASSWORD=tu_password_mysql
```
Y leerlo con `process.env.JWT_SECRET`.

### 2. Contraseñas en texto plano
**Problema:** El login compara contraseñas directamente sin hash.
```js
// ❌ Así está ahora (inseguro):
if (password !== user.password) { ... }
```
**Solución:** Usar `bcrypt` para hashear al registrar y comparar al login:
```js
import bcrypt from 'bcrypt';
const match = await bcrypt.compare(password, user.password_hash);
```

### 3. No hay script de inicio en `package.json`
**Problema:** No puedes usar `npm start`.  
**Solución:** Agregar al `package.json`:
```json
"scripts": {
    "start": "node backend/server.js",
    "dev": "nodemon backend/server.js"
}
```
Luego puedes usar `npm run dev`.

### 4. JWT no se genera en el login
**Problema:** El controller devuelve `id` y `email` pero no un token JWT.  
Esto significa que `verifyToken` nunca funcionará porque no hay token que enviar.  
**Pendiente:** Generar y retornar un token en el controller de login.

---

## 7. Estructura de Archivos del Proyecto

```
History-clinc-web/
├── backend/
│   ├── server.js                ← Punto de entrada, arranca el servidor
│   ├── app.js                   ← Config de Express y registro de rutas
│   ├── config/
│   │   └── db.js                ← Conexión al pool de MySQL
│   ├── routes/
│   │   └── auth.routes.js       ← URLs de autenticación
│   ├── middlewares/
│   │   └── auth.middleware.js   ← validateSchema + verifyToken
│   ├── schemas/
│   │   └── auth.schema.js       ← Reglas de validación con Zod
│   ├── controllers/
│   │   └── auth.controller.js   ← Lógica de login
│   ├── models/
│   │   └── user.model.js        ← Consulta SQL de usuarios
│   └── utils/
│       └── helpers.util.js      ← successResponse / errorResponse
├── Frontend/
│   ├── login.html
│   ├── menu_alumno.html
│   ├── menu_maestro.html
│   └── ...
├── package.json
└── pnpm-lock.yaml
```
