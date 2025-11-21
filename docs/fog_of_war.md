# PRD: Niebla de Guerra (Fog of War)

## 1. Resumen

Este documento describe los requisitos para una nueva funcionalidad de "Niebla de Guerra" (Fog of War). El objetivo es permitir al Dungeon Master (DM) ocultar el mapa con una capa de niebla y revelar áreas específicas de forma manual. Adicionalmente, se podrá añadir "zonas de oscuridad" permanentes que no pueden ser reveladas, para ocultar secciones secretas del mapa de forma definitiva.

La funcionalidad debe ser intuitiva y flexible, permitiendo la edición de las zonas reveladas y oscuras después de su creación.

## 2. Requisitos Funcionales (FR)

- **FR1: Capa de Niebla:** El sistema debe poder superponer una capa semi-transparente sobre todo el `MapCanvas` que oculte el mapa base.
- **FR2: Revelado de Áreas:** El DM debe poder "limpiar" o "recortar" porciones de esta niebla para hacer visible el mapa que hay debajo. La herramienta de revelado debe permitir crear formas poligonales flexibles (no solo cuadrados o círculos).
- **FR3: Zonas de Oscuridad Total:** El DM debe poder dibujar áreas de oscuridad total (color negro sólido, opaco) sobre cualquier parte del mapa, incluida la niebla o las zonas ya reveladas. Estas zonas tienen la máxima prioridad visual y no se pueden "revelar".
- **FR4: Modo de Edición:** Debe existir un "Modo de Edición de Niebla" que permita:
    - Activar/desactivar la capa de niebla.
    - Seleccionar la herramienta para "Revelar Área".
    - Seleccionar la herramienta para "Añadir Oscuridad".
    - (Opcional, v2) Seleccionar, mover o eliminar polígonos de niebla/oscuridad ya existentes.
- **FR5: Persistencia:** El estado de la niebla de guerra (las áreas reveladas y las zonas de oscuridad) debe guardarse junto con el resto de la configuración del mapa, para que se recupere al cargar una sesión.

## 3. Propuesta de Implementación Técnica

Dado el stack actual basado en **React, TypeScript y HTML5 Canvas**, la mejor alternativa es gestionar y renderizar la niebla de guerra directamente en el canvas principal (`MapCanvas.tsx`) para asegurar el máximo rendimiento y una perfecta sincronización con el zoom y el paneo del mapa.

### a. Gestión del Estado (`useFogOfWar.ts`)

- Se creará un nuevo hook custom `useFogOfWar` para encapsular la lógica y el estado.
- El estado consistirá en dos arrays de polígonos:
  ```typescript
  interface FogOfWarState {
    isEnabled: boolean;
    clearedAreas: Polygon[]; // Polígonos de áreas visibles
    darknessAreas: Polygon[]; // Polígonos de oscuridad total
  }

  type Polygon = { id: string; points: { x: number; y: number }[] };
  ```
- Este hook expondrá funciones para añadir/eliminar/actualizar polígonos en ambos arrays.

### b. Renderizado en `MapCanvas.tsx`

El ciclo de renderizado del canvas se actualizará para dibujar las capas en el orden correcto:

1.  **Dibujar Mapa Base:** Renderizar la imagen del mapa como se hace actualmente.
2.  **Dibujar Capa de Niebla:** Si `state.isEnabled` es `true`, dibujar un rectángulo grande, semi-transparente (ej. `rgba(0, 0, 0, 0.8)`) que cubra todo el canvas.
3.  **"Recortar" las Áreas Reveladas:**
    - Cambiar la operación de composición del canvas a `globalCompositeOperation = 'destination-out'`.
    - Iterar sobre el array `state.clearedAreas` y dibujar cada polígono. Esta operación "borrará" la forma del polígono de la capa de niebla, haciendo visible el mapa de abajo.
4.  **Dibujar Zonas de Oscuridad Total:**
    - Restaurar la operación de composición a su valor por defecto: `globalCompositeOperation = 'source-over'`.
    - Iterar sobre el array `state.darknessAreas` y dibujar cada polígono con un color negro sólido (`#000000`). Esto los dibujará por encima de todo lo demás.

### c. Componentes de UI

- **`FogControls.tsx`:** Se creará un nuevo componente, similar a `GridControls` o `EffectControls`. Contendrá:
    - Un switch para activar/desactivar la niebla (`isEnabled`).
    - Un botón para entrar/salir del "Modo Edición".
    - Botones para seleccionar la herramienta "Revelar Área" o "Añadir Oscuridad" cuando se está en modo edición.
- **`MapCanvas.tsx`:** Se modificará para que, en "Modo Edición", capture los eventos de click del usuario para dibujar los nuevos polígonos punto por punto sobre el canvas. Un doble click o presionar `Enter` podría finalizar la forma del polígono.

## 4. Flujo de Usuario (Ejemplo)

1.  El DM carga un mapa.
2.  En la barra de herramientas, hace clic en un nuevo icono de "Niebla". Aparecen los `FogControls`.
3.  El DM activa el switch "Activar Niebla". El mapa se oscurece.
4.  El DM hace clic en "Editar Niebla" y luego en "Revelar Área".
5.  El cursor cambia. El DM hace varios clics en el mapa para delinear una habitación. El sistema muestra una vista previa del polígono que se está creando.
6.  El DM hace doble clic para finalizar. El polígono se añade a `clearedAreas` y la habitación se hace visible instantáneamente.
7.  El DM selecciona "Añadir Oscuridad", dibuja un polígono sobre un pasadizo secreto. Ese pasadizo ahora es completamente negro.

## 5. Consideraciones

- **Rendimiento:** Dibujar directamente en el canvas es muy performante. Se debe evitar tener un número excesivo de polígonos con miles de vértices para no impactar el rendimiento en el futuro.
- **Serialización:** El estado del hook `useFogOfWar` (los arrays de polígonos) deberá ser serializable a JSON para poder guardarlo y cargarlo fácilmente.
- **Coordenadas:** Toda la lógica de dibujo y guardado de polígonos debe operar sobre las coordenadas del mundo/mapa, no las coordenadas del canvas/pantalla, para que el zoom y el paneo funcionen correctamente. La conversión ya se maneja en los `utils` existentes.
