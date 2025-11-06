# Vivienda Manager

Aplicación web moderna para la administración integral de edificios y comunidades. Este proyecto está construido con Next.js 14, Tailwind CSS y Prisma (SQLite) para entregar una experiencia mobile-first desde el inicio del MVP.

## Requisitos

- Node.js 18+
- npm, pnpm o yarn

## Configuración inicial

1. Instala dependencias:

   ```bash
   npm install
   ```

2. Copia el archivo de entorno y genera la base de datos SQLite:

   ```bash
   cp .env.example .env
   npx prisma migrate dev --name init
   ```

3. Ejecuta el entorno de desarrollo:

   ```bash
   npm run dev
   ```

La aplicación quedará disponible en `http://localhost:3000`.

## Estructura principal

- `app/`: Rutas App Router con diseño mobile-first y componentes server/client.
- `components/`: UI reutilizable (botones, layout, proveedores de tema, etc.).
- `lib/`: Utilidades compartidas (`cn` para clases, helpers futuros).
- `prisma/`: Definición del esquema de datos y migraciones.

## Roadmap inmediato

- Implementar autenticación multi-tenant.
- Construir CRUD de propiedades, unidades y usuarios.
- Desarrollar módulos de finanzas, documentos y comunicación interna.

## Licencia

Pendiente de definir.
