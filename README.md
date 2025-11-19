# 🎮 GameZone Store

## Descripción
GameZone Store es una aplicación web moderna que permite a los usuarios buscar, filtrar y comparar videojuegos de diferentes tiendas digitales, utilizando la API de CheapShark para obtener ofertas en tiempo real.

## Características Principales
✅ **Carga inicial de juegos** - Obtiene 20+ juegos desde la API de CheapShark  
✅ **Búsqueda funcional** - Busca juegos por nombre en tiempo real  
✅ **Filtrado por tienda** - Filtra resultados por Steam, Epic Games, Humble Store, etc.  
✅ **Ordenamiento** - Ordena por precio ascendente/descendente o mayor descuento  
✅ **Modal de detalles** - Muestra información completa de cada juego  
✅ **Indicador de carga** - Spinner animado durante las peticiones a la API  
✅ **Manejo de errores** - Mensajes claros en caso de problemas  
✅ **Diseño responsivo** - Optimizado para móvil, tablet y desktop  

## Tecnologías Utilizadas
- **HTML5** - Estructura semántica
- **CSS3 + Tailwind CSS v4** - Estilos moderno y responsive
- **JavaScript (ES6+)** - Lógica y interactividad
- **Async/Await** - Manejo de operaciones asincrónicas
- **Fetch API** - Comunicación con servidor
- **CheapShark API** - Datos de juegos y ofertas

## Instalación y Uso

### Prerrequisitos
- Node.js (para compilar Tailwind CSS)
- Navegador moderno

### Pasos de instalación
```bash
# Clonar el repositorio
git clone <URL_REPOSITORIO>
cd gamezone-store

# Instalar dependencias
npm install

# Compilar Tailwind CSS (si es necesario)
npx tailwindcss -i ./src/input.css -o ./public/output.css --minify
```

### Ejecutar la aplicación
Abre `public/index.html` directamente en tu navegador o usa un servidor local:
```bash
# Con Python 3
python -m http.server 8000

# Con Node.js (http-server)
npx http-server public
```

Luego accede a `http://localhost:8000` en tu navegador.

## Estructura del Proyecto
```
gamezone-store/
├── public/
│   ├── index.html        # Archivo HTML principal
│   ├── script.js         # Lógica JavaScript
│   └── output.css        # Estilos compilados (Tailwind)
├── src/
│   └── input.css         # Archivo de entrada para Tailwind
├── package.json          # Dependencias del proyecto
└── README.md             # Este archivo
```

## Funcionalidades Implementadas

### 1. Carga Inicial de Juegos
- Obtiene 20 juegos mediante el endpoint `/deals` de CheapShark
- Muestra un indicador de carga mientras se procesan los datos
- Manejo de errores con mensaje informativo

### 2. Búsqueda de Juegos
- Campo de entrada para escribir nombres de juegos
- Botón de búsqueda o tecla Enter para activar
- Utiliza el endpoint `/games?title=` de CheapShark
- Valida que el campo no esté vacío

### 3. Filtrado Dinámico
- Selector de tienda con 12 opciones
- Filtra resultados sin hacer nuevas peticiones a la API
- Combina con búsqueda y ordenamiento

### 4. Ordenamiento
- **Precio ascendente** - Juegos más baratos primero
- **Precio descendente** - Juegos más caros primero
- **Mayor descuento** - Ofertas con más descuento primero
- **Nombre (A-Z)** - Orden alfabético

### 5. Modal de Detalles
Muestra:
- Imagen del juego
- Nombre
- Precio original (tachado)
- Precio en oferta (verde)
- Porcentaje de descuento
- Nombre de la tienda
- Botón para ir a la tienda

### 6. Indicadores Visuales
- Spinner animado durante carga
- Mensajes de error claros
- Badges de descuento en las tarjetas
- Efectos hover en tarjetas y botones

## API Utilizada
**CheapShark API** - https://apidocs.cheapshark.com/

### Endpoints utilizados:
- `GET /deals?pageSize=20&pageNumber=0` - Obtener deals/ofertas
- `GET /games?title=<term>&limit=20` - Buscar juegos por nombre
- `GET /deals?id=<dealID>` - Obtener detalles de una oferta

## Notas de Implementación
- Las tarjetas se generan dinámicamente con JavaScript (no están hardcodeadas)
- Se utiliza try...catch y async/await para manejo de errores
- Los datos se filtran y ordenan sin recargar la API innecesariamente
- El DOM se limpia correctamente antes de renderizar nuevos elementos
- Compatible con navegadores modernos (Chrome, Firefox, Safari, Edge)

## Autor
GameZone Developer  
Diciembre 2025

## Licencia
ISC

---

**Nota**: Esta es una aplicación educativa desarrollada como proyecto final práctico de un curso de desarrollo web.
