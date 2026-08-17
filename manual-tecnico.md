# Manual Técnico - LDAP Console

Este documento describe la arquitectura interna, decisiones de diseño y stack tecnológico utilizado en el desarrollo de la aplicación LDAP Console.

## 🏗 Arquitectura del Sistema

El proyecto sigue un enfoque **Monorepo**, separando claramente las responsabilidades en capas:

1.  **Infraestructura (Capa de Datos)**
    *   **Contenedor Docker (`nowsci/samba-domain`)**: Actúa como Controlador de Dominio de Active Directory completo basado en Samba4.
    *   **Volúmenes**: Utiliza volúmenes persistentes y privilegios elevados para gestionar los *Extended Attributes* (xattr) y *Access Control Lists* (ACL) de los sistemas de archivos (necesario para GPOs y SYSVOL).

2.  **Backend (Capa de Lógica / API)**
    *   **Stack**: Node.js (v18+) + Express + TypeScript.
    *   **LDAP Client**: Se comunica directamente con el contenedor del AD utilizando la librería `ldapjs`.
    *   **Seguridad**:
        *   Las peticiones internas al AD se realizan obligatoriamente mediante **LDAPS (puerto 636)**. Samba4 requiere conexiones seguras para operaciones sensibles (como autenticación por contraseña).
        *   La API REST emite un **JSON Web Token (JWT)** al autenticarse exitosamente, el cual es utilizado de forma *stateless* por el frontend.
    *   **Base de Datos Secundaria (Telemetría)**: Se implementa una pequeña base de datos local SQLite (`telemetry.sqlite`) para persistir el estado de los equipos y usuarios conectados (Heartbeats) de manera paralela y sin sobrecargar el LDAP con escrituras constantes.

3.  **Frontend (Capa de Presentación)**
    *   **Stack**: Angular 22 (Standalone Components) + Angular Material.
    *   **Diseño**: Mobile-first, implementando SCSS puro para efectos de transiciones.
    *   **Gestión de Estado**: Utiliza **Angular Signals** (ej. `computed`, `signal`) para el estado reactivo, reemplazando a RxJS donde el flujo es síncrono o dependiente de estado local (como el estado de Autenticación).

## 🧪 Estrategia de Testing (Frontend)

Se ha migrado de las herramientas antiguas (Karma/Jasmine) al nuevo ecosistema de Angular:

*   **Test Runner**: **Vitest** + JSDOM integrado nativamente a través del builder oficial de Angular 22 (`@angular/build:unit-test`).
*   **Cobertura**: Gestionada a través del motor **V8**, configurado directamente en `angular.json` (`"coverage": true`).
*   **Aislamiento**:
    *   El enrutador se mockea utilizando `provideRouter([])`.
    *   El cliente HTTP se intercepta mediante `HttpTestingController` y `provideHttpClientTesting()`.
    *   **Mocks de Entorno**: Se utilizan polyfills para inyectar APIs del navegador (`window.matchMedia`) necesarias para Angular Material.

*Comando para ejecución:* `npm run test -- --no-watch`

### Ejemplos Vivos (TDD en Backend)
Fieles a la metodología de **TDD como Documentación**, las operaciones del Directorio Activo se prueban mediante E2E contra el contenedor Samba4 real. Estos archivos sirven de guía de uso.

**Crear un Usuario (Extraído de `usuario-test.spec.ts`):**
```typescript
// 1. Asegurar que no existe
let user = await UserService.findUser('usuario-test');

// 2. Crear usuario a través del servicio
await UserService.createUser('usuario-test', 'Usuario', 'DePrueba', 'test@corp.local');

// 3. Buscar para validar su creación
user = await UserService.findUser('usuario-test');
```

**Crear un Grupo (Extraído de `grupo-test.spec.ts`):**
```typescript
// 1. Crear el grupo usando el servicio (sAMAccountName)
await GroupService.createGroup('grupo-test', 'Grupo de pruebas automatizadas E2E');

// 2. Validar
let group = await GroupService.findGroup('grupo-test');
```

## 🔒 Flujo de Autenticación

1.  El Frontend envía credenciales a `/api/auth/login`.
2.  El Backend realiza un *LDAP Bind* hacia el servidor Samba4 por LDAPS.
3.  Si el Bind es exitoso, el Backend firma un JWT y lo devuelve al Frontend.
4.  El Frontend almacena el JWT en el `localStorage` y levanta una *Signal* de sesión.
5.  Los **Angular Route Guards** (`authGuard`) bloquean el acceso a las rutas protegidas a nivel del cliente.
6.  Un **HttpInterceptor** (`jwtInterceptor`) intercepta silenciosamente todas las llamadas salientes del `HttpClient`. Si existe un token, inyecta la cabecera `Authorization: Bearer <token>`. Además, si recibe un error `401 Unauthorized` de cualquier respuesta, fuerza el cierre de sesión instantáneo y protege la aplicación.
