# DnD Mapper - Technical Documentation (v0)

## 1. Overview

This document provides a detailed technical overview of the DnD Mapper application. DnD Mapper is a sophisticated, client-side-only virtual tabletop (VTT) application designed for tabletop role-playing games. It is built using modern web technologies to provide a rich, interactive experience for mapping and token management directly in the browser.

This document is intended to be a living document, to be updated as the application evolves. It will be used as a basis for research on how to deploy this application as a cloud-based, subscription-based micro-SaaS.

## 2. Technology Stack

The application is built with a modern, robust technology stack, primarily focused on the React ecosystem.

*   **Core Framework**:
    *   **React (v19.2.0)**: The core of the application is built with React, a declarative, component-based library for building user interfaces.
    *   **React DOM (v19.2.0)**: The `react-dom` package provides the DOM-specific methods that allow React to interact with the web page.
*   **Language**:
    *   **TypeScript (v5.9.3)**: The application is written in TypeScript, a strongly-typed superset of JavaScript. This provides type safety and improves developer experience and code maintainability.
*   **Build Tool**:
    *   **Vite (v7.2.2)**: A modern, extremely fast build tool and development server. It provides a faster and leaner development experience compared to older tools like Webpack. The `@vitejs/plugin-react` plugin is used to enable React support.
*   **UI & Styling**:
    *   **CSS Modules**: The application uses CSS Modules for styling, as evidenced by the `*.css` files imported into the `*.tsx` components. This allows for locally-scoped CSS, avoiding global namespace conflicts.
    *   **Framer Motion (v12.23.24)**: A production-ready motion library for React. It is used for creating fluid animations and transitions throughout the application.
    *   **Lucide React (v0.554.0)**: Provides a set of clean and consistent icons.
    *   **Heroicons (v2.2.0)**: Another set of high-quality SVG icons used in the application.
    *   **React Spinners (v0.17.0)**: Used for displaying loading indicators.
*   **Animation**:
    *   **Lottie Web (v5.13.0)**: A library that parses Adobe After Effects animations exported as json with Bodymovin and renders them natively on mobile and on the web.

## 3. Code Structure

The project follows a standard structure for a React/Vite application.

```
/
├───.gitignore
├───index.html
├───package.json
├───README.md
├───tsconfig.json
├───vite.config.ts
├───public/
│   ├───effects/
│   └───images/
└───src/
    ├───App.css
    ├───App.tsx         # Main application component and state orchestrator
    ├───index.css
    ├───main.tsx        # Entry point of the application
    ├───components/     # Reusable React components
    ├───hooks/          # Custom hooks for business logic
    ├───types/          # TypeScript type definitions
    └───utils/          # Utility functions (canvas, IndexedDB, etc.)
```

## 4. Architecture

The application follows a component-based architecture with a clear separation of concerns. All logic and data reside on the client-side, with no backend server dependency.

### Core Components

*   **`App.tsx`**: This is the root component of the application. It is responsible for orchestrating the entire application, managing the primary state, and passing data and callbacks to child components and hooks.
*   **`src/components/*`**: This directory contains a rich set of reusable React components that make up the UI of the application. These include controls for the grid, effects, fog of war, tokens, and more.
*   **`src/hooks/*`**: Custom hooks are used to encapsulate and manage specific pieces of application logic. This is a key part of the architecture, promoting code reuse and separation of concerns.

### Key Hooks

*   **`useGrid.ts`**: Manages all logic related to the grid overlay on the map.
*   **`useEffects.ts`**: Handles the application and rendering of visual effects.
*   **`useFogOfWar.ts`**: Manages the fog of war layer, a crucial feature for gameplay.
*   **`useTokens.ts`**: Manages the tokens on the map, including their positions and properties.
*   **`useTokenLibrary.ts`**: Manages the library of available tokens, interacting with the persistence layer.
*   **`useMapLibrary.ts`**: Manages the library of available maps, interacting with the persistence layer.

### Data Structures

A central `src/types/index.ts` file defines all the core data structures for the application. This provides a single source of truth for the shape of the data, ensuring type safety and consistency throughout the codebase. Key types include `MapState`, `TokenLibrary`, `MapLibrary`, `Effect`, `Token`, and `FogOfWarState`.

## 5. State Management

The application's state is managed through a combination of React's built-in state management (`useState`, `useEffect`) and custom hooks.

*   **Session State**: The main session state, including the current map, token positions, and other settings, is managed within the `App.tsx` component. This state is persisted to the browser's `localStorage`, allowing users to refresh the page and resume their session.
*   **Asset Libraries**: Larger assets like maps and tokens are not stored in `localStorage` due to size limitations. Instead, they are persisted in IndexedDB.

## 6. Persistence

The application employs a two-tiered persistence strategy:

1.  **`localStorage`**: Used for storing the main `MapState` object, which is relatively small. This allows for quick saving and loading of the current session.
2.  **`IndexedDB`**: Used for storing larger binary data, specifically map images and token images. The `src/utils/indexedDB.ts` file provides a robust, promise-based abstraction layer over the IndexedDB API. This utility also includes a migration path to move data from an older `localStorage`-based storage solution to IndexedDB, ensuring backward compatibility for existing users.

The interaction with IndexedDB is neatly encapsulated within the `useMapLibrary.ts` and `useTokenLibrary.ts` hooks, which handle loading, adding, and deleting assets from the database.

## 7. Rendering

The map, grid, tokens, and effects are rendered onto an HTML5 Canvas. A set of utility functions in `src/utils/canvasRender.ts` and `src/utils/canvasUtils.ts` are used to manage the rendering logic.

## 8. Key Features

Based on the codebase, the application supports the following key features:

*   **Map Management**: Load and switch between different maps.
*   **Token Management**: Add, move, and manage tokens on the map. A token library is available to store and organize tokens.
*   **Grid System**: A configurable grid can be overlaid on the map.
*   **Fog of War**: A fog of war layer that can be revealed or hidden.
*   **Visual Effects**: The ability to add visual effects to the map.
*   **Fullscreen Mode**: The application can be viewed in fullscreen mode.
*   **Zoom and Pan**: The map can be zoomed and panned.
*   **Persistence**: The state of the map and the asset libraries are persisted between sessions.
*   **Cross-tab Synchronization**: Changes to the token library are synchronized across different browser tabs.

## 9. Considerations for Production Deployment (Micro-SaaS)

Transforming this client-side application into a cloud-based, subscription-based micro-SaaS requires significant architectural changes. The following are key considerations for this transition.

### a. Backend & API

A backend server will be necessary to handle user data, authentication, and real-time collaboration.

*   **Recommendation**: A Node.js backend with **Express.js** or **FastAPI** (Python) would be a good choice. These frameworks are lightweight, fast, and well-suited for building RESTful APIs and WebSocket servers.
*   **Real-time Collaboration**: To allow multiple users to interact with the same map simultaneously (a key feature for a VTT), a real-time communication protocol is needed. **WebSockets** would be the ideal technology for this. Libraries like `Socket.IO` or `ws` for Node.js can be used.

### b. Authentication & Authorization

A robust authentication and authorization system is crucial for a subscription-based service.

*   **Recommendation**: Implement a solution using a service like **Auth0**, **Firebase Authentication**, or build a custom solution with **Passport.js** (for Node.js). This will handle user registration, login, and secure access to the application's features.
*   **Subscription Management**: A payment provider like **Stripe** or **Paddle** should be integrated to manage subscriptions and restrict access to premium features.

### c. Database

The current persistence model (localStorage and IndexedDB) is not suitable for a multi-user, multi-device environment. A centralized database is required.

*   **Recommendation**: A **PostgreSQL** database is a robust and scalable choice for storing user data, map configurations, and other relational data. For the asset libraries (maps, tokens), a cloud-based object storage solution is more appropriate.

### d. Asset Storage

Storing large binary files (maps, tokens) in the database is not efficient.

*   **Recommendation**: Use a cloud object storage service like **Amazon S3**, **Google Cloud Storage**, or **Cloudflare R2**. When a user uploads a new asset, the backend would upload it to the object storage and save a reference (URL) to the asset in the database.

### e. State Management

With a backend and real-time collaboration, the state management model will need to be redesigned.

*   **Recommendation**: The "single source of truth" will shift from the client's browser to the backend. The client-side application will need to be refactored to:
    1.  Fetch its initial state from the backend.
    2.  Send user actions to the backend via API calls or WebSocket messages.
    3.  Receive state updates from the backend in real-time.
    *   Client-side state management libraries like **Redux Toolkit** or **Zustand** can help manage this complex, server-driven state.

### f. CI/CD & Hosting

A continuous integration and deployment (CI/CD) pipeline is essential for efficient and reliable releases.

*   **Frontend Hosting**: The React application can be hosted on a static web hosting service like **Vercel**, **Netlify**, or **AWS Amplify**.
*   **Backend Hosting**: The backend can be deployed as a containerized application on a platform like **AWS ECS**, **Google Kubernetes Engine**, or as a serverless function on **AWS Lambda** or **Google Cloud Functions**.
*   **CI/CD Pipeline**: Tools like **GitHub Actions**, **GitLab CI**, or **Jenkins** can be used to automate the testing, building, and deployment of both the frontend and backend.
