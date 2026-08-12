# LDAP Console

**LDAP Console** es una alternativa moderna, de nueva generación y *mobile-first* a herramientas clásicas como phpLDAPadmin. Su propósito es proveer una interfaz sencilla y potente para gestionar usuarios, grupos, equipos y Políticas de Grupo (GPOs) de un dominio de Active Directory (Samba4).

📚 **Documentación detallada:**
* [Manual de Usuario](./manual-de-usuario.md)
* [Manual Técnico](./manual-tecnico.md)

## 🏛️ Arquitectura del Proyecto

El proyecto está estructurado como un **Monorepo** basado en una metodología *12-Factor App*, compuesto por tres capas principales:

1. **Infraestructura (Docker):** Controlador de Dominio Active Directory utilizando la imagen de `nowsci/samba-domain`. Es la única fuente de verdad (sin bases de datos adicionales).
2. **Backend (Node.js + TypeScript):** Una API REST *stateless* construida con Express y `ldapjs` para interactuar con el directorio de manera nativa.
3. **Frontend (Angular):** Una SPA (*Single Page Application*) responsiva con **Angular Material** y preparada para integrar *Angular Agent Skills*.

---

## 🚀 Guía de Inicio Rápido (Getting Started)

### 1. Requisitos Previos
* **Docker** y **Docker Compose** instalados en tu sistema.
* **Node.js** (v18 o superior) y **npm**.
* *Importante para usuarios de Linux:* Asegúrate de detener cualquier servicio Samba local o resolutor DNS (como `systemd-resolved`) que pueda ocupar los puertos `53`, `137`, `138`, `139`, `445` o `389`.

```bash
# Ejemplo para detener el Samba local en sistemas basados en systemd:
sudo systemctl stop smbd nmbd
sudo systemctl disable smbd nmbd
```

### 2. Configuración Inicial (Entorno)
Clona el repositorio e inicializa las variables de entorno:

```bash
git clone https://github.com/tu-usuario/ldap-console.git
cd ldap-console
cp .env.example .env
```
Abre el archivo `.env` y configura el dominio (`AD_DOMAIN`) y contraseña (`AD_PASSWORD`). Las contraseñas en Active Directory requieren alta complejidad (mayúsculas, minúsculas, números y símbolos).

### 3. Levantar la Infraestructura (Controlador de Dominio)
Inicia el contenedor de Docker que alojará nuestro Active Directory:

```bash
docker compose up -d
```
> **Nota técnica sobre los volúmenes:** El `docker-compose.yml` utiliza volúmenes de Docker gestionados (named volumes) y el modo privilegiado (`privileged: true`) para permitir que Samba4 establezca atributos extendidos (xattrs) y ACLs en las carpetas SYSVOL, evitando así problemas clásicos de `Access Denied`.

Puedes verificar que el Controlador de Dominio está listo comprobando los logs:
```bash
docker compose logs -f
```
Cuando leas *"Server Role: active directory domain controller"*, ¡estará listo!

### 4. Ejecutar el Backend
El backend está escrito en TypeScript y utiliza `tsx` para una ejecución de desarrollo rápida. Se conectará automáticamente al Samba4 que acabamos de levantar.

```bash
cd backend
npm install
npm run dev
```

El servidor arrancará en el puerto `3000` (o el que hayas definido en el `.env`).

#### Probar la conexión con Active Directory
Puedes verificar que la conexión LDAPS ha sido un éxito llamando al endpoint de estado:

```bash
curl http://localhost:3000/api/status
```
*Respuesta esperada:*
```json
{
  "status": "success",
  "message": "Conexión y autenticación (bind) con Active Directory LDAP exitosa!",
  "domain": "corp.local"
}
```
> **Importante:** El backend utiliza el protocolo **LDAPS seguro (puerto 636)** ya que Samba4, por defecto, exige cifrado (*Strong Auth Required*) para autenticar usuarios con contraseñas. Para el entorno de desarrollo local, el backend está configurado para aceptar certificados autofirmados (`rejectUnauthorized: false`).

### 5. Ejecutar el Frontend
La interfaz de usuario está desarrollada en Angular con Angular Material y SCSS puro (efectos de hover *Eye of Medina*).

```bash
cd frontend
npm install
npm run start
```

La aplicación web estará disponible en `http://localhost:4200/`.

### 6. Ejecutar las Pruebas Unitarias (Testing)
El frontend de Angular está configurado con **Vitest nativo** y el motor de cobertura V8. Para ejecutar los tests interactivos:

```bash
cd frontend
npm run test
```
Para ejecutar los tests de una sola vez y visualizar el informe de cobertura HTML (generado en `frontend/coverage/index.html`):
```bash
npm run test -- --no-watch
```

---

## 🧹 Comandos Útiles

* **Pausar la infraestructura (sin borrar nada):** `docker compose stop`
* **Reiniciar la infraestructura:** `docker compose start`
* **Destruir los contenedores (conservando los datos del AD):** `docker compose down`
* **Borrar absolutamente todo (peligro: borra la BD de usuarios del AD):** `docker compose down -v`