# 🚀 GoPark Auth Service

Microservicio de autenticación para GoPark usando Clerk y Supabase PostgreSQL.

## 📋 Tabla de Contenidos

- [Descripción](#descripción)
- [Arquitectura](#arquitectura)
- [Tecnologías](#tecnologías)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
- [Endpoints](#endpoints)
- [Webhooks](#webhooks)
- [Despliegue](#despliegue)
- [Testing](#testing)

## 📖 Descripción

Este microservicio actúa como puente entre Clerk (autenticación) y la base de datos de GoPark. Sincroniza usuarios creados en Clerk con PostgreSQL y proporciona endpoints para validar JWT y gestionar perfiles.

**Flujo de autenticación:**

```
[Flutter App] → [Clerk] → [JWT Token] → [Este Microservicio] → [Supabase PostgreSQL]
```

## 🏗️ Arquitectura

```
┌─────────────────┐
│   Flutter App   │
└────────┬────────┘
         │ Login con Clerk
         ▼
┌─────────────────┐
│     Clerk       │ ← Identity Provider
└────────┬────────┘
         │
         ├─→ Webhooks (user.created, user.updated, etc.)
         │
         ▼
┌─────────────────┐
│  Auth Service   │ ← Este microservicio
│  (Node.js)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Supabase      │ ← Base de datos
│   PostgreSQL    │
└─────────────────┘
```

## 🛠️ Tecnologías

- **Node.js** 18+
- **TypeScript** 5.3
- **Express** - Framework web
- **Clerk** - Autenticación y gestión de usuarios
- **Supabase** - Base de datos PostgreSQL
- **Svix** - Verificación de webhooks
- **jsonwebtoken** - Validación de JWT
- **Zod** - Validación de schemas

## 📦 Instalación

### Prerrequisitos

- Node.js 18 o superior
- npm o yarn
- Cuenta en Clerk
- Proyecto en Supabase

### Pasos

1. **Clonar el repositorio:**

```bash
git clone <repository-url>
cd gopark-auth-service
```

2. **Instalar dependencias:**

```bash
npm install
```

3. **Configurar variables de entorno:**

```bash
cp .env.example .env
```

Editar `.env` con tus credenciales (ver [Configuración](#configuración))

4. **Crear la tabla en Supabase:**

Ejecutar el script SQL en `database/migrations/001_create_users_table.sql` en tu dashboard de Supabase.

5. **Iniciar en modo desarrollo:**

```bash
npm run dev
```

## ⚙️ Configuración

### 1. Configurar Clerk

#### a) Crear cuenta y proyecto

1. Ve a [https://clerk.com](https://clerk.com)
2. Crea una organización: **GoPark**
3. Crea un proyecto: **GoPark Auth**

#### b) Obtener las claves

En el dashboard de Clerk, ve a **API Keys**:

- `CLERK_PUBLISHABLE_KEY` - Clave pública (empieza con `pk_test_` o `pk_live_`)
- `CLERK_SECRET_KEY` - Clave secreta (empieza con `sk_test_` o `sk_live_`)

#### c) Configurar JWT Template

1. Ve a **JWT Templates**
2. Crea uno nuevo llamado `gopark-jwt`
3. Agrega estos claims:
   - `email`
   - `first_name`
   - `last_name`
   - `image_url`

#### d) Configurar Webhooks

1. Ve a **Webhooks** → **Add Endpoint**
2. URL: `https://tu-dominio.com/api/webhooks/clerk/webhook`
   - Para desarrollo local, usa [ngrok](https://ngrok.com): `ngrok http 3001`
3. Selecciona estos eventos:
   - ✅ `user.created`
   - ✅ `user.updated`
   - ✅ `user.deleted`
   - ✅ `session.created`
   - ✅ `session.ended`
4. Copia el **Webhook Secret** (empieza con `whsec_`)

### 2. Configurar Supabase

#### a) Crear el proyecto (si no existe)

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea un nuevo proyecto

#### b) Obtener las credenciales

En **Project Settings** → **API**:

- `SUPABASE_URL` - URL del proyecto
- `SUPABASE_ANON_KEY` - Clave anónima pública
- `SUPABASE_SERVICE_ROLE_KEY` - Clave de servicio (⚠️ Mantener secreta)

#### c) Crear la tabla de usuarios

1. Ve a **SQL Editor**
2. Ejecuta el contenido de `database/migrations/001_create_users_table.sql`
3. (Opcional) Ejecuta `database/migrations/002_create_audit_logs_table.sql`

### 3. Variables de Entorno

Tu archivo `.env` debe verse así:

```env
# Puerto del servidor
PORT=3001

# Clerk Configuration
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxx
CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxx
CLERK_ISSUER_URL=https://your-app.clerk.accounts.dev

# Supabase Configuration
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Environment
NODE_ENV=development

# CORS Origins
CORS_ORIGINS=http://localhost:3000,http://localhost:8080
```

## 🚀 Uso

### Desarrollo

```bash
npm run dev
```

### Producción

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

### Format

```bash
npm run format
```

## 📡 Endpoints

### Health Check

#### `GET /api/health`

Verifica que el servicio esté funcionando.

**Response:**

```json
{
  "success": true,
  "status": "healthy",
  "service": "gopark-auth-service",
  "timestamp": "2025-11-19T12:00:00.000Z"
}
```

#### `GET /api/health/db`

Verifica la conexión con la base de datos.

### Users

#### `GET /api/users/profile`

Obtiene el perfil del usuario autenticado.

**Headers:**

```
Authorization: Bearer <clerk_jwt_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "clerk_id": "user_xxxxx",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "kyc_status": "not_started",
    "is_active": true,
    "created_at": "2025-11-19T12:00:00.000Z"
  }
}
```

#### `GET /api/users/:clerkId`

Obtiene un usuario por su Clerk ID (requiere autenticación).

#### `PATCH /api/users/:clerkId/role`

Actualiza el rol de un usuario (solo admin).

**Body:**

```json
{
  "role": "host"
}
```

#### `PATCH /api/users/:clerkId/kyc`

Actualiza el estado KYC (solo admin).

**Body:**

```json
{
  "kyc_status": "verified"
}
```

### Webhooks

#### `POST /api/webhooks/clerk/webhook`

Endpoint para recibir webhooks de Clerk.

**⚠️ Este endpoint solo debe ser llamado por Clerk.**

## 🔔 Webhooks

El servicio escucha los siguientes eventos de Clerk:

| Evento             | Acción                              |
| ------------------ | ----------------------------------- |
| `user.created`     | Crea el usuario en PostgreSQL       |
| `user.updated`     | Actualiza los datos del usuario     |
| `user.deleted`     | Desactiva el usuario (soft delete)  |
| `session.created`  | Actualiza `last_sign_in_at`         |
| `session.ended`    | Registra el fin de sesión           |

### Configurar ngrok para desarrollo local

```bash
# Instalar ngrok
npm install -g ngrok

# Exponer puerto 3001
ngrok http 3001

# Copia la URL que te da (ejemplo: https://abc123.ngrok.io)
# Úsala en Clerk Webhooks: https://abc123.ngrok.io/api/webhooks/clerk/webhook
```

## 🔐 Autenticación JWT

### Desde Flutter

1. El usuario se autentica en Clerk desde Flutter
2. Clerk devuelve un JWT token
3. Flutter guarda el token en `flutter_secure_storage`
4. Para cada llamada al backend:

```dart
final token = await storage.read(key: 'clerk_jwt');
final response = await http.get(
  Uri.parse('https://api.gopark.com/api/users/profile'),
  headers: {
    'Authorization': 'Bearer $token',
  },
);
```

### Verificación del JWT

El middleware `verifyClerkJWT` valida:

- ✅ Firma del token (usando JWKS de Clerk)
- ✅ Expiración
- ✅ Issuer correcto
- ✅ Algoritmo RS256

## 🌐 Despliegue

### Railway

1. Instalar Railway CLI:

```bash
npm install -g railway
```

2. Iniciar sesión:

```bash
railway login
```

3. Crear proyecto:

```bash
railway init
```

4. Agregar variables de entorno:

```bash
railway variables set CLERK_SECRET_KEY=sk_live_xxx
railway variables set SUPABASE_URL=https://xxx.supabase.co
# ... resto de variables
```

5. Desplegar:

```bash
railway up
```

### Render / Heroku / Cloud Run

Ver documentación específica de cada plataforma.

## 🧪 Testing

```bash
# Ejecutar tests (próximamente)
npm test

# Test de cobertura
npm run test:coverage
```

### Testing manual con cURL

**Health check:**

```bash
curl http://localhost:3001/api/health
```

**Obtener perfil (con JWT):**

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/api/users/profile
```

**Simular webhook de Clerk:**

```bash
curl -X POST http://localhost:3001/api/webhooks/clerk/webhook \
  -H "Content-Type: application/json" \
  -H "svix-id: msg_xxxxx" \
  -H "svix-timestamp: 1234567890" \
  -H "svix-signature: v1,xxxxx" \
  -d '{...}'
```

## 📝 Estructura del Proyecto

```
gopark-auth-service/
├── src/
│   ├── config/           # Configuración (env, database)
│   ├── controllers/      # Controladores de rutas
│   ├── middleware/       # Middlewares (JWT, webhooks, errors)
│   ├── routes/           # Definición de rutas
│   ├── services/         # Lógica de negocio
│   ├── types/            # Tipos de TypeScript
│   └── index.ts          # Punto de entrada
├── database/
│   └── migrations/       # Scripts SQL
├── .env.example          # Ejemplo de variables de entorno
├── package.json
├── tsconfig.json
└── README.md
```

## 🔒 Seguridad

- ✅ Validación de webhooks con Svix
- ✅ Verificación de JWT con JWKS
- ✅ Row Level Security (RLS) en Supabase
- ✅ Helmet.js para headers de seguridad
- ✅ CORS configurado
- ✅ Variables sensibles en `.env`
- ✅ Service Role Key solo en backend

## 🤝 Integración con Flutter

### 1. Instalar dependencias en Flutter

```yaml
dependencies:
  http: ^1.1.0
  flutter_secure_storage: ^9.0.0
```

### 2. Autenticación

```dart
// Guardar token después del login
await storage.write(key: 'clerk_jwt', value: token);
```

### 3. Llamadas al API

```dart
class AuthService {
  final storage = FlutterSecureStorage();
  final baseUrl = 'https://api.gopark.com/api';

  Future<Map<String, dynamic>> getProfile() async {
    final token = await storage.read(key: 'clerk_jwt');
    final response = await http.get(
      Uri.parse('$baseUrl/users/profile'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );
    return jsonDecode(response.body);
  }
}
```

## 📚 Recursos

- [Clerk Documentation](https://clerk.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Express Documentation](https://expressjs.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 👥 Autores

- **GoPark Team**

## 📄 Licencia

MIT

---

**¿Necesitas ayuda?** Crea un issue en el repositorio.

