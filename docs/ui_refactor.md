# Propuesta de Refactorización de UI para Modo Pantalla Completa

## 1. Problema

Actualmente, la aplicación no se visualiza correctamente al entrar en modo de pantalla completa. Esto impide que los usuarios accedan a las herramientas y controles esenciales (niebla de guerra, grid, tokens, etc.), haciendo que el modo de pantalla completa sea inutilizable para la creación o modificación de mapas en tiempo real.

## 2. Solución Propuesta

Implementar un **menú lateral desplegable y oculto por defecto** que se active únicamente en el modo de pantalla completa.

**Comportamiento:**

1.  Cuando la aplicación esté en modo de pantalla completa, el menú de controles estará oculto fuera de la vista, a la izquierda.
2.  Un área de activación (trigger) de unos 15-20 píxeles de ancho se posicionará en el borde izquierdo de la pantalla.
3.  Cuando el usuario mueva el cursor del ratón sobre esta área de activación, el menú lateral se deslizará suavemente desde la izquierda hacia la vista.
4.  El menú permanecerá visible mientras el cursor esté sobre él. Al salir el cursor del área del menú, este se volverá a ocultar.
5.  Este comportamiento solo se activará cuando `document.fullscreenElement` no sea `null`. En el modo de vista normal, la UI puede mantener su disposición actual.

## 3. Análisis Técnico y Viabilidad

La solución es completamente viable con el stack tecnológico actual (React, TypeScript, CSS).

-   **React:** Se usarán hooks (`useState`, `useEffect`) para gestionar el estado de la visibilidad del panel y para detectar cambios en el modo de pantalla completa.
-   **TypeScript:** Aportará seguridad en los tipos para los componentes y hooks que se crearán.
-   **CSS:** Se utilizarán transiciones (`transition`) y transformaciones (`transform: translateX()`) para crear el efecto de deslizamiento suave del menú, lo cual es muy eficiente en términos de rendimiento.
-   **API del Navegador:** Se usará la [Fullscreen API](https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API) para detectar si la aplicación está en modo de pantalla completa y reaccionar a esos cambios.

## 4. Plan de Implementación

### Paso 1: Crear un Hook para Detectar el Modo Pantalla Completa

Crear un hook reutilizable `src/hooks/useFullscreen.ts` que devuelva un booleano indicando si la aplicación está en pantalla completa. Este hook se encargará de añadir y limpiar los event listeners (`fullscreenchange`).

```typescript
// src/hooks/useFullscreen.ts
import { useState, useEffect } from 'react';

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  return isFullscreen;
}
```

### Paso 2: Agrupar los Controles en un Nuevo Componente `SidePanel`

Crear un nuevo componente `src/components/SidePanel.tsx` que agrupe todos los controles actuales (`GridControls`, `FogControls`, `TokenControls`, `ZoomControls`, etc.). Esto centralizará la lógica del panel.

```tsx
// src/components/SidePanel.tsx
import { GridControls } from './GridControls';
import { FogControls } from './FogControls';
// ...otros imports

export function SidePanel() {
  return (
    <div className="side-panel">
      {/* Agrupar aquí todos los controles */}
      <CollapsibleSection title="Grid">
        <GridControls />
      </CollapsibleSection>
      <CollapsibleSection title="Fog of War">
        <FogControls />
      </CollapsibleSection>
      {/* ...etc */}
    </div>
  );
}
```

### Paso 3: Crear un Componente de Layout `FullscreenLayout`

Crear un componente `src/components/FullscreenLayout.tsx` que gestione la lógica de visualización del panel. Este componente usará el hook `useFullscreen` y el estado para la visibilidad del panel.

```tsx
// src/components/FullscreenLayout.tsx
import { useState } from 'react';
import { useFullscreen } from '../hooks/useFullscreen';
import { SidePanel } from './SidePanel';
import './FullscreenLayout.css';

export function FullscreenLayout({ children }: { children: React.ReactNode }) {
  const isFullscreen = useFullscreen();
  const [isPanelVisible, setPanelVisible] = useState(false);

  if (!isFullscreen) {
    // En modo normal, podrías renderizar la UI original o una adaptada.
    // Por simplicidad, aquí asumimos que el layout principal vive fuera.
    // Esto se ajustaría para integrar con la UI existente.
    return (
      <div className="layout-normal">
        <div className="sidebar-normal">
          <SidePanel />
        </div>
        <main className="content-normal">{children}</main>
      </div>
    );
  }

  // Lógica para modo pantalla completa
  return (
    <div className="fullscreen-layout">
      <div 
        className="hover-trigger-zone" 
        onMouseEnter={() => setPanelVisible(true)} 
      />
      <div 
        className={`fullscreen-panel ${isPanelVisible ? 'visible' : ''}`}
        onMouseLeave={() => setPanelVisible(false)}
      >
        <SidePanel />
      </div>
      <main className="fullscreen-content">{children}</main>
    </div>
  );
}
```

### Paso 4: Estilar el Layout con CSS

Crear `src/components/FullscreenLayout.css` para definir los estilos del panel, el trigger y la animación.

```css
/* src/components/FullscreenLayout.css */
.fullscreen-layout {
  position: relative;
  width: 100%;
  height: 100%;
}

.hover-trigger-zone {
  position: absolute;
  top: 0;
  left: 0;
  width: 20px; /* Ancho del área de activación */
  height: 100%;
  z-index: 100;
}

.fullscreen-panel {
  position: absolute;
  top: 0;
  left: 0;
  width: 300px; /* Ancho del menú */
  height: 100%;
  background-color: #282c34; /* O el color de fondo del tema */
  z-index: 101;
  transform: translateX(-100%);
  transition: transform 0.3s ease-in-out;
  overflow-y: auto;
  padding: 1rem;
}

.fullscreen-panel.visible {
  transform: translateX(0);
}

.fullscreen-content {
  width: 100%;
  height: 100%;
}
```

### Paso 5: Refactorizar `App.tsx`

Finalmente, se modificaría `App.tsx` para usar el nuevo `FullscreenLayout` como contenedor principal del `MapCanvas` y la lógica asociada, decidiendo si muestra el layout de pantalla completa o el normal. La implementación exacta dependerá de cómo se quiera la UI en modo no-fullscreen. Una opción es usar el `FullscreenLayout` para ambas vistas.

## 5. Archivos a Crear/Modificar

-   **Nuevos:**
    -   `src/hooks/useFullscreen.ts`
    -   `src/components/SidePanel.tsx` (nombre sugerido)
    -   `src/components/SidePanel.css`
    -   `src/components/FullscreenLayout.tsx`
    -   `src/components/FullscreenLayout.css`
-   **A modificar:**
    -   `src/App.tsx`: Para integrar el nuevo layout y reorganizar los componentes de control dentro del `SidePanel`.
    -   `src/App.css`: Para ajustar estilos si es necesario.

## 6. Consideraciones Adicionales

-   **Dispositivos Táctiles:** El `hover` no existe en dispositivos táctiles. Si se planea dar soporte, se necesitará un mecanismo alternativo, como un pequeño botón "hamburguesa" en la esquina para mostrar/ocultar el menú.
-   **Accesibilidad:** Asegurarse de que el menú sea accesible mediante teclado. Por ejemplo, permitir que se pueda "tabular" hacia el menú y abrirlo con la tecla `Enter` o `Espacio`.
