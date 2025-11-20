# ⚡ Quick Start - GoPark Auth Service

Guía rápida para poner en marcha el microservicio en 5 minutos.

## ✅ Ya está listo

- [x] Proyecto configurado con todas las dependencias
- [x] Supabase proyecto **Zenda** configurado
- [x] Tabla `users` creada en Supabase
- [x] Tabla `audit_logs` creada en Supabase
- [x] Código del microservicio completo

## 🚀 Pasos para iniciar

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar archivo .env

Crea un archivo `.env` en la raíz del proyecto con este contenido:

```env
# Puerto del servidor
PORT=3001

# Clerk Configuration
CLERK_SECRET_KEY=sk_test_TU_CLAVE_AQUI
CLERK_PUBLISHABLE_KEY=pk_test_TU_CLAVE_AQUI
CLERK_WEBHOOK_SECRET=whsec_TU_CLAVE_AQUI
CLERK_ISSUER_URL=https://tu-app.clerk.accounts.dev

# Supabase Configuration - Proyecto Zenda
SUPABASE_URL=https://tucxkgscnrahclaeudgs.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1Y3hrZ3NjbnJhaGNsYWV1ZGdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwODY3NTcsImV4cCI6MjA2NzY2Mjc1N30.yHdUB407k-T9Bbw6VHMgXGM-tSljpG-PHWNA7AZkKpg
SUPABASE_SERVICE_ROLE_KEY=TU_SERVICE_ROLE_KEY_AQUI

# Environment
NODE_ENV=development

# CORS Origins
CORS_ORIGINS=http://localhost:3000,http://localhost:8080
```

### 3. Obtener las credenciales faltantes

#### a) Supabase Service Role Key

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard/project/tucxkgscnrahclaeudgs/settings/api)
2. Busca **Project API keys** → **service_role**
3. Cópiala y pégala en `SUPABASE_SERVICE_ROLE_KEY`

#### b) Clerk (Si aún no tienes cuenta)

1. Ve a [clerk.com](https://clerk.com)
2. Crea una cuenta
3. Crea organización: **GoPark**
4. Crea proyecto: **GoPark Auth**
5. Ve a **API Keys** y copia:
   - `CLERK_PUBLISHABLE_KEY` (pk_test_...)
   - `CLERK_SECRET_KEY` (sk_test_...)
   - `CLERK_ISSUER_URL` (https://xxx.clerk.accounts.dev)

### 4. Iniciar el servidor

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

### 5. Probar que funciona

Abre otra terminal:

```bash
curl http://localhost:3001/api/health
```

Deberías ver:

```json
{
  "success": true,
  "status": "healthy",
  "service": "gopark-auth-service"
}
```

### 6. Configurar Webhook (Opcional para desarrollo)

**Solo si quieres probar la sincronización con Clerk:**

```bash
# Instalar ngrok
npm install -g ngrok

# Exponer puerto 3001
ngrok http 3001
```

Copia la URL de ngrok (ej: `https://abc123.ngrok.io`)

Luego en Clerk:
1. Ve a **Webhooks** → **Add Endpoint**
2. URL: `https://abc123.ngrok.io/api/webhooks/clerk/webhook`
3. Eventos: user.created, user.updated, user.deleted, session.created, session.ended
4. Copia el **Signing Secret** y actualiza `CLERK_WEBHOOK_SECRET` en `.env`

---

## 📡 Endpoints Disponibles

| Endpoint | Método | Descripción | Auth |
|----------|--------|-------------|------|
| `/api/health` | GET | Health check | No |
| `/api/health/db` | GET | Health check DB | No |
| `/api/webhooks/clerk/webhook` | POST | Webhook de Clerk | Svix |
| `/api/users/profile` | GET | Perfil del usuario | JWT |
| `/api/users/:clerkId` | GET | Usuario por ID | JWT |
| `/api/users/:clerkId/role` | PATCH | Actualizar rol | JWT |
| `/api/users/:clerkId/kyc` | PATCH | Actualizar KYC | JWT |

---

## 🧪 Probar el sistema completo

### 1. Crear un usuario en Clerk

1. Ve a tu [dashboard de Clerk](https://dashboard.clerk.com)
2. **Users** → **Create User**
3. Rellena: email, password, nombre
4. Crea el usuario

### 2. Verificar sincronización

En la terminal del servidor, deberías ver:

```
📥 Webhook recibido: user.created
👤 Creando usuario: user_xxxxx
✅ Usuario creado en DB
```

### 3. Verificar en Supabase

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard/project/tucxkgscnrahclaeudgs)
2. **Table Editor** → **users**
3. Deberías ver el usuario sincronizado

### 4. Obtener JWT y probar endpoint

En Clerk, ve al usuario y genera un JWT:
1. **Users** → selecciona el usuario
2. **Generate session token**
3. Selecciona template `gopark-jwt` (créalo primero si no existe)
4. Copia el token

Prueba el endpoint:

```bash
curl -H "Authorization: Bearer TU_JWT_TOKEN" \
  http://localhost:3001/api/users/profile
```

---

## 🎯 ¿Qué sigue?

1. **Para Flutter:** Compartir `CLERK_PUBLISHABLE_KEY` con el equipo
2. **Para Backend:** Reutilizar el middleware `verifyJWT` en otros servicios
3. **Para Producción:** Seguir los pasos en `SETUP.md` para desplegar

---

## 📚 Documentación Adicional

- `README.md` - Documentación completa del proyecto
- `SETUP.md` - Guía paso a paso detallada
- `CREDENTIALS.md` - Cómo obtener todas las credenciales
- `database/migrations/` - Scripts SQL de las migraciones

---

## ❌ Errores Comunes

### "Error de configuración de variables de entorno"

**Solución:** Verifica que todas las variables en `.env` estén completas.

### "Error al conectar a Supabase"

**Solución:** Verifica `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`.

### "Invalid webhook signature"

**Solución:** Verifica que `CLERK_WEBHOOK_SECRET` sea correcto.

### "Invalid or expired token"

**Solución:** Genera un nuevo JWT desde Clerk o verifica `CLERK_ISSUER_URL`.

---

**¿Listo?** Ejecuta `npm run dev` y empieza a construir! 🚀

