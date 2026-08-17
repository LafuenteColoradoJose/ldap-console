# Manual de Usuario - LDAP Console

Bienvenido a **LDAP Console**. Esta aplicación web te permite gestionar un dominio de Active Directory de forma sencilla e intuitiva desde cualquier dispositivo.

## 🔑 1. Acceso a la Plataforma (Login)

Para entrar a la aplicación, necesitas utilizar un usuario y contraseña válidos dentro del dominio de Active Directory.

1.  Abre la aplicación en tu navegador web.
2.  Aparecerá una pantalla de bienvenida limpia y minimalista.
3.  Introduce tu nombre de usuario (ej. `Administrator`) y tu contraseña.
4.  Si las credenciales son correctas, el sistema te dará la bienvenida y cargará tu panel de control (Dashboard).

## 📱 2. Navegación y Disposición Visual

La interfaz está diseñada bajo el patrón de **diseño responsivo**. Se adapta a tu dispositivo:

*   **En Escritorio (Pantallas grandes):** El menú de navegación (Sidebar) se ubica en el lateral izquierdo. Es una barra estilizada que permanece minimizada (mostrando solo iconos) y se expande suavemente al pasar el ratón por encima (Efecto "Eye of Medina"), sin desplazar el resto del contenido de tu pantalla.
*   **En Dispositivos Móviles (Teléfonos y Tablets pequeñas):** La barra lateral se oculta completamente para ahorrar espacio. Para navegar, simplemente pulsa el botón del menú de "hamburguesa" situado en la cabecera (arriba a la izquierda), y la barra se desplegará. Al hacer clic en un enlace, se cerrará automáticamente.

## 🛠️ 3. Módulos y Funcionalidades

LDAP Console está dividido en varias secciones accesibles desde el menú lateral:

*   **Dashboard (Panel de Control):** Portada interactiva de la aplicación con estética moderna (glassmorphism y modo oscuro) que muestra estadísticas globales del dominio. Ahora cuenta de forma inteligente a los verdaderos usuarios (excluyendo a las cuentas de los propios ordenadores) para mostrar métricas exactas.
*   **Gestión de Usuarios:** Permite crear, modificar, deshabilitar y eliminar cuentas de usuario. Además, gracias a la **Telemetría**, el icono de perfil de cada usuario cambiará de color en tiempo real:
    *   🟢 **Verde:** El usuario tiene sesión iniciada activamente en un equipo del dominio.
    *   🔴 **Rojo:** El usuario no está conectado actualmente.
    *   ⚪ **Gris:** La cuenta del usuario está deshabilitada (se muestra explícitamente el estado *Habilitado / Deshabilitado*).
*   **Equipos (Computers):** Muestra todos los ordenadores y servidores que han sido unidos al Active Directory.
    *   *Estado en Tiempo Real (Telemetría/Heartbeat):* A diferencia de los clásicos escaneos de PING ICMP (que suelen ser bloqueados por firewalls de Windows), Ldap Console utiliza un script ligero (Heartbeat) que se ejecuta en los clientes de forma silenciosa cada 10 minutos para notificar su estado. Esto permite saber con total certeza si un equipo está encendido (icono verde) o apagado (icono rojo).
*   **Estructura del Dominio:** Visualiza la jerarquía de las Unidades Organizativas (OU) y contenedores principales de tu AD.
    *   *Gestión rápida de Grupos:* Incorpora un **Panel Lateral Deslizante (Drawer)**. Al hacer clic en un grupo dentro del árbol de carpetas, se despliega un panel lateral de cristal donde puedes buscar y añadir/quitar usuarios de ese grupo de forma instantánea sin perder la posición en el árbol.

## 🚪 4. Cierre de Sesión

Para proteger tus datos, cuando termines de gestionar tu dominio, puedes cerrar sesión de forma segura:

1.  Haz clic en el botón de **Logout** (icono de puerta de salida) situado en el menú lateral.
2.  Serás desconectado inmediatamente, tus credenciales temporales se eliminarán de tu navegador y volverás a la pantalla de inicio de sesión.
