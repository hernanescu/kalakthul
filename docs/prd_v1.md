# PRD v1: Visualizador de Mapas TTRPG

## 1. Resumen

Este documento describe los requisitos para un **Visualizador de Mapas para TTRPG**, una aplicación web diseñada para facilitar la dirección de partidas de rol de mesa (TTRPG). La herramienta permitirá a un Game Master (GM) cargar una imagen de mapa, superponer una grilla personalizable y manipular tokens que representan a personajes y enemigos.

El objetivo principal es ofrecer una solución simple y efectiva para mostrar el mapa a los jugadores en una pantalla secundaria (como una TV), con un "Modo Presentación" que oculte la interfaz del GM para una experiencia inmersiva.

## 2. Objetivos

*   **O-1:** Desarrollar un prototipo funcional (MVP) que cumpla con las necesidades básicas de visualización de mapas de TTRPG.
*   **O-2:** Priorizar la facilidad de uso y una interfaz intuitiva que no requiera conocimientos técnicos.
*   **O-3:** Implementar un modo de pantalla completa (Modo Presentación) que ofrezca una vista limpia del mapa para los jugadores.
*   **O-4:** Establecer una base de código sólida que permita futuras expansiones de funcionalidades.

## 3. Requisitos Funcionales (RF)

### RF-01: Carga de Mapas
*   El usuario debe poder hacer clic en un botón para abrir el selector de archivos de su sistema operativo.
*   El usuario debe poder seleccionar y cargar un archivo de imagen (formatos soportados: `.jpg`, `.png`, `.webp`).
*   La imagen cargada se mostrará como el fondo del área de juego principal.

### RF-02: Gestión de la Grilla
*   El usuario debe poder especificar el número de filas y columnas de la grilla.
*   La aplicación debe dibujar la grilla sobre la imagen del mapa.
*   El usuario debe poder ajustar la opacidad y el color de las líneas de la grilla para asegurar una buena visibilidad sobre cualquier mapa.
*   El usuario debe poder ocultar o mostrar la grilla en cualquier momento.

### RF-03: Gestión de Tokens
*   El usuario debe poder añadir nuevos tokens al mapa. Inicialmente, los tokens serán formas geométricas simples (círculos).
*   El usuario debe poder asignar un color a cada token para diferenciarlo.
*   El usuario debe poder hacer clic y arrastrar un token para moverlo por el mapa.
*   El movimiento de los tokens debe "ajustarse" (snap) a las celdas de la grilla.
*   El usuario debe poder seleccionar un token.
*   El usuario debe poder cambiar el tamaño de un token para que ocupe múltiples celdas (ej: 1x1, 2x2, 3x3).
*   El usuario debe poder eliminar un token del mapa.

### RF-04: Modo Presentación
*   Debe existir un botón para activar/desactivar el "Modo Presentación".
*   Al activar este modo, la aplicación se mostrará en pantalla completa.
*   Toda la interfaz de usuario (paneles de control, botones, menús) será ocultada.
*   Solo el mapa, la grilla y los tokens permanecerán visibles.
*   El usuario podrá salir de este modo presionando la tecla `Esc` o a través de un botón discreto.

### RF-05: Persistencia de Sesión (Opcional para v1)
*   La aplicación debería guardar el estado actual de la sesión (mapa cargado, configuración de grilla, posición y tamaño de los tokens) en el almacenamiento local del navegador.
*   Al recargar la página, la sesión debería restaurarse automáticamente.

## 4. Requisitos No Funcionales (RNF)

*   **RNF-01 (Rendimiento):** La aplicación debe ser fluida, sin lag perceptible al arrastrar tokens o interactuar con la interfaz.
*   **RNF-02 (Compatibilidad):** La aplicación debe ser compatible con las últimas versiones de los navegadores web modernos (Google Chrome, Mozilla Firefox, Safari, Microsoft Edge).
*   **RNF-03 (Usabilidad):** La interfaz debe ser clara, auto-explicativa y requerir una curva de aprendizaje mínima.

## 5. Fuera del Alcance (para la v1)

Las siguientes funcionalidades no se incluirán en la versión inicial para acotar el desarrollo y entregar un producto funcional rápidamente:

*   Cuentas de usuario y almacenamiento en la nube.
*   Colaboración multi-usuario en tiempo real.
*   Carga de imágenes personalizadas para los tokens.
*   Efectos visuales avanzados (ej: niebla de guerra, plantillas de hechizos).
*   Integración con sistemas de TTRPG (ej: hojas de personaje, tiradas de dados).
*   Capas de dibujo o anotaciones sobre el mapa.
