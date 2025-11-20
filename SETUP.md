# 📖 Guía de Setup Completa - GoPark Auth Service

Esta guía te llevará paso a paso desde cero hasta tener el microservicio funcionando completamente.

## 🎯 Fase 1: Crear cuenta en Clerk

### 1.1 Registro

1. Ve a [https://clerk.com](https://clerk.com)
2. Haz clic en **Sign Up**
3. Regístrate con tu email o GitHub

### 1.2 Crear Organización

1. Una vez dentro, haz clic en **Create Organization**
2. Nombre: **GoPark**
3. Haz clic en **Create**

### 1.3 Crear Proyecto

1. Dentro de la organización, haz clic en **Create Application**
2. Nombre: **GoPark Auth**
3. Selecciona los métodos de autenticación:
   - ✅ Email
   - ✅ Password
   - 🔄 Google (opcional para el futuro)
   - 🔄 Apple (opcional para el futuro)
4. Haz clic en **Create Application**

### 1.4 Obtener las claves

1. Ve a **API Keys** en el menú lateral
2. Copia y guarda:
   - **Publishable Key** (empieza con `pk_test_`)
   - **Secret Key** (empieza con `sk_test_`)

---

## 🎯 Fase 2: Configurar el repositorio

### 2.1 Clonar y configurar

```bash
# Ya estás en el directorio correcto
cd C:\Users\nachi\Desktop\proyectos\LoginService

# Instalar dependencias
npm install
```

### 2.2 Crear archivo .env

```bash
# Copiar el ejemplo
cp .env.example .env
```

### 2.3 Editar .env

Abre `.env` y completa las variables (te falta):

```env
PORT=3001

# Clerk - Obtén estos valores del dashboard
CLERK_SECRET_KEY=sk_test_XXXXXXXXXX
CLERK_PUBLISHABLE_KEY=pk_test_XXXXXXXXXX
CLERK_WEBHOOK_SECRET=whsec_XXXXXXXXXX  # Lo obtendrás en el paso 4
CLERK_ISSUER_URL=https://tu-app.clerk.accounts.dev

# Supabase - Estos los configuraremos en el siguiente paso
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

NODE_ENV=development
CORS_ORIGINS=http://localhost:3000,http://localhost:8080
```

---

## 🎯 Fase 3: Configurar Supabase

### Opción A: Usar proyecto existente

Tienes dos proyectos:
1. **Bot_killa** (us-east-2)
2. **Zenda** (sa-east-1) ← Más cercano si estás en Latinoamérica

### Opción B: Crear nuevo proyecto

1. Ve a [https://supabase.com](https://supabase.com)
2. Haz clic en **New Project**
3. Completa:
   - **Name**: GoPark
   - **Database Password**: (guárdala en un lugar seguro)
   - **Region**: sa-east-1 (São Paulo) o us-east-1 (Virginia)
4. Haz clic en **Create new project**

### 3.1 Obtener credenciales

Una vez creado el proyecto:

1. Ve a **Project Settings** → **API**
2. Copia:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** → `SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ (Mantener secreta)

### 3.2 Crear la tabla de usuarios

1. Ve a **SQL Editor** en el menú lateral
2. Haz clic en **New Query**
3. Copia y pega el contenido de `database/migrations/001_create_users_table.sql`
4. Haz clic en **Run**
5. Deberías ver el mensaje: ✅ Success. No rows returned

### 3.3 (Opcional) Crear tabla de auditoría

1. Crea otra nueva query
2. Copia y pega el contenido de `database/migrations/002_create_audit_logs_table.sql`
3. Haz clic en **Run**

### 3.4 Verificar las tablas

1. Ve a **Table Editor**
2. Deberías ver:
   - ✅ `users`
   - ✅ `audit_logs` (si la creaste)

---

## 🎯 Fase 4: Configurar JWT Template en Clerk

### 4.1 Crear template

1. En el dashboard de Clerk, ve a **JWT Templates**
2. Haz clic en **New Template**
3. Selecciona **Blank**
4. Nombre: `gopark-jwt`

### 4.2 Configurar claims

En el editor JSON, agrega:

```json
{
  "email": "{{user.primary_email_address}}",
  "first_name": "{{user.first_name}}",
  "last_name": "{{user.last_name}}",
  "image_url": "{{user.profile_image_url}}",
  "user_id": "{{user.id}}"
}
```

5. Haz clic en **Save**

---

## 🎯 Fase 5: Configurar Webhooks en Clerk

### 5.1 Instalar ngrok (para desarrollo local)

```bash
# Instalar globalmente
npm install -g ngrok

# O descargar desde https://ngrok.com/download
```

### 5.2 Iniciar el microservicio

```bash
npm run dev
```

Deberías ver:

```
╔═══════════════════════════════════════════════╗
║     🚀 GoPark Auth Service Started           ║
╠═══════════════════════════════════════════════╣
║  Environment: development                     ║
║  Port:        3001                            ║
║  Clerk:       ✅ Configured                    ║
║  Supabase:    ✅ Connected                     ║
╚═══════════════════════════════════════════════╝
```

### 5.3 Exponer el puerto con ngrok

En otra terminal:

```bash
ngrok http 3001
```

Copia la URL que te da, algo como: `https://abc123.ngrok.io`

### 5.4 Crear el webhook en Clerk

1. En Clerk, ve a **Webhooks**
2. Haz clic en **Add Endpoint**
3. **Endpoint URL**: `https://abc123.ngrok.io/api/webhooks/clerk/webhook`
4. Selecciona estos eventos:
   - ✅ user.created
   - ✅ user.updated
   - ✅ user.deleted
   - ✅ session.created
   - ✅ session.ended
5. Haz clic en **Create**

### 5.5 Obtener el Webhook Secret

1. Haz clic en el webhook que acabas de crear
2. Copia el **Signing Secret** (empieza con `whsec_`)
3. Agrégalo a tu `.env`:

```env
CLERK_WEBHOOK_SECRET=whsec_XXXXXXXXXX
```

4. Reinicia el servidor (Ctrl+C y `npm run dev` de nuevo)

---

## 🎯 Fase 6: Probar el sistema

### 6.1 Health Check

Abre tu navegador o usa cURL:

```bash
curl http://localhost:3001/api/health
```

Deberías ver:

```json
{
  "success": true,
  "status": "healthy",
  "service": "gopark-auth-service",
  "timestamp": "2025-11-19T..."
}
```

### 6.2 Crear un usuario de prueba en Clerk

1. En el dashboard de Clerk, ve a **Users**
2. Haz clic en **Create User**
3. Completa:
   - Email: `test@gopark.com`
   - Password: `Test1234!`
   - First name: `Test`
   - Last name: `User`
4. Haz clic en **Create**

### 6.3 Verificar sincronización

1. En la terminal donde corre el microservicio, deberías ver:

```
📥 Webhook recibido: user.created
👤 Creando usuario: user_XXXXXXXXXX
✅ Usuario creado en DB: uuid (Clerk: user_XXXXXXXXXX)
```

2. Verifica en Supabase:
   - Ve a **Table Editor** → **users**
   - Deberías ver el usuario que acabas de crear

### 6.4 Obtener un JWT de prueba

1. En Clerk, ve al usuario que creaste
2. Haz clic en **Generate Session**
3. Selecciona el template `gopark-jwt`
4. Copia el token

### 6.5 Probar endpoint protegido

```bash
curl -H "Authorization: Bearer TU_TOKEN_JWT" \
  http://localhost:3001/api/users/profile
```

Deberías ver:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "clerk_id": "user_xxx",
    "email": "test@gopark.com",
    "name": "Test User",
    "role": "user",
    "kyc_status": "not_started",
    ...
  }
}
```

---

## 🎯 Fase 7: Preparar para integración con Flutter

### 7.1 Obtener la Publishable Key

En Clerk → API Keys, copia la **Publishable Key** (`pk_test_xxx`)

### 7.2 Compartir con el equipo de Flutter

Ellos necesitarán:

```dart
// En Flutter, configurar Clerk
final clerkPublishableKey = 'pk_test_XXXXXXXXXX';
```

### 7.3 Documentar el flujo

El flujo para Flutter será:

1. Usuario ingresa email/password en la app
2. Flutter llama a Clerk directamente para autenticar
3. Clerk devuelve un JWT
4. Flutter guarda el JWT en `flutter_secure_storage`
5. Para cada llamada al backend:
   ```dart
   headers: {
     'Authorization': 'Bearer $token',
   }
   ```

---

## 🎯 Fase 8: Preparar para otros microservicios

Cuando tu backend (GoPark-Back) necesite validar tokens:

### 8.1 Instalar dependencias

En el backend principal:

```bash
npm install jsonwebtoken jwks-rsa
```

### 8.2 Crear middleware de validación

Puedes reutilizar el código de `src/middleware/verifyJWT.ts` de este proyecto.

### 8.3 Proteger rutas

```typescript
app.use('/api/bookings', verifyClerkJWT, bookingsRouter);
app.use('/api/parking-spots', verifyClerkJWT, parkingSpotsRouter);
```

---

## 🎯 Fase 9: Despliegue a producción

### 9.1 Railway (Recomendado)

```bash
# Instalar CLI
npm install -g railway

# Login
railway login

# Inicializar
railway init

# Agregar variables
railway variables set CLERK_SECRET_KEY=sk_live_xxx
railway variables set SUPABASE_URL=https://xxx.supabase.co
railway variables set SUPABASE_SERVICE_ROLE_KEY=xxx
railway variables set CLERK_WEBHOOK_SECRET=whsec_xxx
railway variables set CLERK_PUBLISHABLE_KEY=pk_live_xxx
railway variables set CLERK_ISSUER_URL=https://xxx.clerk.accounts.dev
railway variables set NODE_ENV=production
railway variables set CORS_ORIGINS=https://gopark.com

# Deploy
railway up
```

### 9.2 Actualizar webhook en Clerk

1. En Clerk → Webhooks
2. Edita el endpoint
3. Cambia la URL a: `https://tu-app.railway.app/api/webhooks/clerk/webhook`

### 9.3 Cambiar a claves de producción

1. En Clerk, ve a **API Keys**
2. Cambia de **Development** a **Production**
3. Actualiza las variables en Railway con las claves `pk_live_` y `sk_live_`

---

## ✅ Checklist Final

Antes de considerar completo el setup:

- [ ] Clerk configurado con organización GoPark
- [ ] Proyecto GoPark Auth creado en Clerk
- [ ] JWT Template `gopark-jwt` configurado
- [ ] Supabase con proyecto GoPark (o usando existente)
- [ ] Tabla `users` creada en Supabase
- [ ] Variables de entorno configuradas en `.env`
- [ ] Webhook de Clerk configurado y funcionando
- [ ] Usuario de prueba creado y sincronizado
- [ ] Endpoint `/api/users/profile` probado con JWT
- [ ] ngrok funcionando para desarrollo local
- [ ] Documentación compartida con equipo de Flutter
- [ ] Microservicio desplegado en Railway/Render/etc.

---

## 🆘 Troubleshooting

### Error: "Missing svix headers"

**Problema:** El webhook no tiene los headers correctos.

**Solución:**
1. Verifica que la URL en Clerk sea correcta
2. Asegúrate de que ngrok esté corriendo
3. Verifica que el `CLERK_WEBHOOK_SECRET` esté correcto

### Error: "Invalid webhook signature"

**Problema:** El secret del webhook es incorrecto.

**Solución:**
1. Ve a Clerk → Webhooks → tu endpoint
2. Copia el Signing Secret nuevamente
3. Actualiza `CLERK_WEBHOOK_SECRET` en `.env`
4. Reinicia el servidor

### Error: "Invalid or expired token"

**Problema:** El JWT no es válido o expiró.

**Solución:**
1. Genera un nuevo token desde Clerk
2. Verifica que `CLERK_ISSUER_URL` sea correcto
3. Asegúrate de usar el template `gopark-jwt`

### Error: "Error al crear usuario: duplicate key"

**Problema:** El usuario ya existe en la DB.

**Solución:**
Esto es normal, el sistema automáticamente intentará actualizar en lugar de crear.

### Base de datos no conecta

**Problema:** No puede conectar a Supabase.

**Solución:**
1. Verifica `SUPABASE_URL` en `.env`
2. Verifica `SUPABASE_SERVICE_ROLE_KEY`
3. Verifica que el proyecto de Supabase esté activo
4. Prueba con: `curl https://tu-proyecto.supabase.co/rest/v1/`

---

## 📞 Contacto

Si tienes problemas durante el setup, revisa:

1. Los logs del servidor (`npm run dev`)
2. Los logs de ngrok
3. Los logs de webhooks en Clerk (Webhooks → tu endpoint → Events)
4. Los logs en Supabase (Logs → API)

---

**¡Listo!** 🎉 Tu microservicio de autenticación está configurado y funcionando.

