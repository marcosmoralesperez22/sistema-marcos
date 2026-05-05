# Sistema-MARCOS (LifeCraft) - Documentación General

## 1. Visión General
**Sistema-MARCOS** es una aplicación web integral diseñada para funcionar como un "Dashboard de Vida" gamificado. Aplica conceptos de videojuegos RPG y planificación personal a la vida real del usuario.

El objetivo principal es motivar y realizar un seguimiento del progreso personal del usuario (Marcos) a lo largo de sus días mediante misiones, hábitos sistemáticos, seguimiento de la salud y obtención de experiencia (XP)/Aura y medallas.

## 2. Arquitectura Tecnológica
El sistema está compuesto por una arquitectura moderna y descentralizada que permite la sincronización automática de información vital y su persistencia a largo plazo:

* **Frontend**: Desarrollado como una Single Page Application (SPA) usando **Vanilla JS** y empaquetado con **Vite**. Posee un sistema de enrutamiento propio (`router.js`) y arquitectura basada en web components/modules puros (HTML/CSS/JS clásico), evitando sobrecarga de frameworks como React o Angular. Su estado global es gestionado por `src/data/store.js` mediante copias locales (`localStorage`) y sincronización en background.
* **Backend**: Construido en **Node.js** con el framework **Express**. Expone una API RESTFul en las rutas `/api/*` y `/api/auth/*`.
* **Base de Datos**: Emplea **PostgreSQL**, donde almacena un historial inmutable del personaje: `users`, estado del juego (`game_state`), tareas (`tasks`, `task_history`), así como métricas biológicas diarias en `daily_data`.
* **Integración Wearable (Zepp OS)**: Posee un subliderazgo técnico llamado `marcos-sync` o `zepp-sync-app`, que es una aplicación nativa para relojes Amazfit (Zepp OS), que extrae del sensor los pasos, calorías quemadas y calidad del sueño para enviarlo al sistema central automáticamente.
* **Despliegue y Entorno**: El entorno de producción y desarrollo se virtualiza mediante **Docker** y **Docker Compose** (Contenedores para Postgres y App Node).

## 3. Módulos y Funcionalidades Principales

### 3.1. 📊 Dashboard (Panel de Control)
El cerebro o base de operaciones del sistema.
*   **Mensajes Inteligentes:** Analiza la data de los últimos 7 días y muestra mensajes de ánimo y contexto analítico dinámico ("Semana sólida", "Día irregular", etc.).
*   **Estado del Jugador (Player State):** Muestra los puntos de vida (Health), progreso para el siguiente Nivel, Racha de días activos (Streak).
*   **Aura (ñaura):** Unidades de puntuación ganadas mediante actividades productivas y perdidas por fallos. Es un medidor directo de productividad diaria.
*   **Progreso Diario de Salud:** Importa datos del reloj (pasos y sueño) de forma visual.
*   **Tareas de Hoy:** Vista rápida de misiones pendientes, completadas o fallidas.

### 3.2. ⚔️ Misiones (Quests)
Es el módulo central de **Task Management** (Gestión de Tareas puntuales).
*   En contraposición a los clásicos "To-Do lists", terminar tareas de esta lista te cataloga la tarea como "Misión Completada" inyectando XP, dinero del juego (potencial) o "Aura".
*   Tiene un control estricto de completado/descompletado con su respectiva alteración del Aura del personaje.

### 3.3. 🔁 Hábitos (Habits)
Módulo dedicado exclusivamente a tareas recurrentes (rutinas diarias, acciones continuas).
*   Permite hacer *Check-in* diario separado del concepto de misión aleatoria.
*   Las integraciones biométricas de Zepp permiten un *Auto-Check* si se cumple un hito de salud (ej: dormir bien o realizar X pasos).

### 3.4. 🫀 Salud y Fitness (Health)
Recopilación a largo plazo del estado biológico:
*   **Métricas de Zepp:** Visualiza la importación de datos del reloj Amazfit Active 2 (sueño, calorías, pasos).
*   **Registro de Gimnasio:** Permite introducir rutinas del gimnasio o ver métricas que cruzan la actividad en la aplicación con la actividad metabólica para obtener un "Score".

### 3.5. 🗺️ Rutas (Roadmaps)
Un creador visual interactivo (editor) para planificar objetivos a medio y largo plazo.
*   Permite estructurar los meses y años mediante esquemas visuales que evitan la sobre-complejidad, manteniendo el enfoque macro.

### 3.6. 🏅 Medallas / Logros (Achievements)
Sistema de validación de hitos vitales.
*   Estructurado como un **Árbol de Habilidades Inmenso**, donde la pantalla es *zoomable y pannable* (se puede hacer zoom y mover como un mapa libre).
*   Los requisitos para obtenerlas se calculan en base a la data histórica recolectada (ej: `checkAllAchievements()` evalúa tareas totales producidas).

### 3.7. 📈 Estadísticas (Stats)
Presenta un análisis retrospectivo:
*   Líneas y gráficos en SVG/Canvas del esfuerzo, puntos de Aura obtenidos por mes y año, ratio de completación de Misiones sobre fallas, y análisis de tendencias para detectar caídas en la disciplina o aumento persistente.

### 3.8. 🎯 Metas (Goals) & 📅 Calendario
*   **Metas**: Visualización estática a largo plazo de los objetivos vitales.
*   **Calendario**: Planificador o *Time-Machine* donde puedes ver qué hiciste un día en el pasado y qué tareas/misiones existían en una fecha determinada.

### 3.9. ⏱️ Pomodoro
Herramienta de Time-Boxing que te ayuda a entrar en 'Estado de Flujo', forzando lapsos ininterrumpidos de trabajo con una integración al medidor de Aura al finalizarlos exitosamente.

### 3.10. ⚙️ Ajustes y Personaje
*   Permite cambiar la fecha de inicio personal, dificultad del juego en caso de desear reajuste de escalado de la XP/Aura.
*   Equipamiento/Armadura: El sistema backend está preparado (`armor`, `inventory`, `amulets`) en la Base de Datos para equipar ítems cosméticos o buffos que se ganen al progresar el usuario.

## 4. Flujo de Datos Principal
1.  **Frontend -> Store:** El SPA pide renderizar la página consultando `store.data` y reaccionando según su patrón de store-listeners.
2.  **API Requests:** Cualquier *check*, completado o modificación primero impacta el array local para no tener tiempos de carga visuales altos (Optimistic UI). Mediante un *debouncer* (`_debounceSaveToAPI()`) se envía luego en formato JSON al Backend en Express sobre el puerto `3000`.
3.  **Zepp Watch -> Bluetooth -> App-Side (Mobile) -> Backend API (`/api/sync`):** El reloj (Watch APP) cuenta los pasos y sueño. Se lo manda a su contraparte en el teléfono móvil que, como tiene acceso a la red de casa, dispara un HTTP POST hacia la API del dashboard para actualizar de manera asíncrona la tabla en la base de datos `daily_data`.
4.  **Backend -> PostgreSQL:** Valida y guarda en la base de datos haciendo persistentes las entradas.

---
Generado para uso y visualización del proyecto MARCOS.
