# DnD Mapper - Docker Setup

Este documento describe cómo configurar y ejecutar DnD Mapper usando Docker Compose.

## Requisitos Previos

- Docker Engine 20.10+
- Docker Compose 2.0+
- Git

## Arquitectura

El sistema está compuesto por 4 servicios contenerizados:

- **dnd-postgres**: Base de datos PostgreSQL 15
- **dnd-storage**: MinIO (S3-compatible) para almacenamiento de imágenes
- **dnd-api**: Backend API Node.js/TypeScript
- **dnd-client**: Frontend React/Vite

## Configuración Inicial

1. **Clonar el repositorio** (si aún no lo has hecho):
```bash
git clone <repository-url>
cd dnd_mapper
```

2. **Crear archivo de variables de entorno**:
```bash
cp .env.example .env
```

3. **Editar `.env`** con tus valores (opcional, los valores por defecto funcionan para desarrollo):
```bash
# PostgreSQL
POSTGRES_USER=dnd_user
POSTGRES_PASSWORD=dnd_password
POSTGRES_DB=dnd_db

# MinIO
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin

# API
API_PORT=3001
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
```

## Iniciar el Sistema

```bash
docker-compose up
```

Para ejecutar en segundo plano:
```bash
docker-compose up -d
```

## Acceder a los Servicios

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **MinIO Console**: http://localhost:9001 (usuario: minioadmin, password: minioadmin)
- **PostgreSQL**: localhost:5432

## Comandos Útiles

### Ver logs
```bash
# Todos los servicios
docker-compose logs -f

# Servicio específico
docker-compose logs -f dnd-api
docker-compose logs -f dnd-client
```

### Detener servicios
```bash
docker-compose down
```

### Detener y eliminar volúmenes (⚠️ elimina datos)
```bash
docker-compose down -v
```

### Reconstruir imágenes
```bash
docker-compose build
```

### Reiniciar un servicio específico
```bash
docker-compose restart dnd-api
```

## Desarrollo

### Hot Reload

Ambos servicios (frontend y backend) tienen hot reload habilitado:
- Cambios en `src/` se reflejan automáticamente en el frontend
- Cambios en `backend/src/` se reflejan automáticamente en el backend

### Base de Datos

Las migraciones se ejecutan automáticamente al iniciar PostgreSQL desde el directorio `backend/migrations/`.

### MinIO

El bucket `dnd-assets` se crea automáticamente al iniciar MinIO y se configura como público para lectura.

## Estructura de Datos

Los datos se persisten en volúmenes Docker:
- `postgres_data`: Datos de PostgreSQL
- `minio_data`: Archivos de MinIO

Estos volúmenes persisten entre reinicios de contenedores.

## Troubleshooting

### Puerto ya en uso
Si algún puerto está en uso, puedes cambiarlo en `docker-compose.yml` o en `.env`.

### Error de conexión a la base de datos
Asegúrate de que el servicio `dnd-postgres` esté completamente iniciado antes de que `dnd-api` intente conectarse. El healthcheck debería manejar esto automáticamente.

### Error al subir imágenes
Verifica que MinIO esté corriendo y que el bucket `dnd-assets` exista. Puedes verificar esto en la consola de MinIO (http://localhost:9001).

### Limpiar todo y empezar de nuevo
```bash
docker-compose down -v
docker-compose up --build
```

## Producción

Para producción, se recomienda:
1. Cambiar todas las contraseñas por defecto
2. Configurar SSL/TLS
3. Usar un servicio de object storage real (S3, Cloudflare R2, etc.) en lugar de MinIO
4. Configurar backups de la base de datos
5. Usar variables de entorno seguras (no commitear `.env`)

## Notas

- En desarrollo, el sistema funciona sin autenticación real (modo demo)
- Las imágenes se procesan automáticamente a WebP en el backend
- El frontend carga imágenes directamente desde MinIO usando URLs públicas

