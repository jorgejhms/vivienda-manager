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
   npx prisma migrate dev --name demo_modules
   ```

3. Ejecuta el entorno de desarrollo:

   ```bash
   npm run dev
   ```

La aplicación quedará disponible en `http://localhost:3000`. El landing principal se mantiene en `/` y la experiencia funcional de demo está disponible en `/demo`.

### Demo funcional

La ruta `/demo` levanta una versión navegable del panel administrativo con todas las funciones clave:

- **Finanzas**: registro de ingresos/egresos, cálculo automático de cuotas por coeficiente y actualización del estado de recibos.
- **Inventario**: alta rápida de activos comunes con seguimiento de fechas, estado y notas.
- **Biblioteca documental**: almacenamiento de reglamentos, estatutos, contratos y actas con enlaces públicos.
- **Calendario y noticias**: anuncios internos, registro de actas y eventos recurrentes.
- **Notificaciones**: simulación de alertas in-app/correo filtradas por audiencia.

La base de datos se auto pobla con información de ejemplo mediante `ensureDemoData` al acceder por primera vez, por lo que no es necesario ejecutar un seed manual.

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
