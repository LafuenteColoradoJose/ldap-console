# Credenciales de Usuarios del Dominio (Active Directory / Samba)

Este archivo contiene el registro de los usuarios creados en el sistema para facilitar las pruebas desde otras máquinas (como clientes Linux o Windows).

## Usuarios Administradores
| Usuario (sAMAccountName) | Contraseña | Notas |
| :--- | :--- | :--- |
| `administrator` | `SuperSegura2026!` | Administrador principal del Dominio (`.env`). |

## Usuarios de Prueba (Test)
| Usuario (sAMAccountName) | Contraseña | Obligado a Cambiar | Notas |
| :--- | :--- | :--- | :--- |
| `prueba2` | `Usuario1.` | Sí | Usuario creado desde la interfaz web (Ldap Console). |
| `prueba` | `Usuario1.` | - | Nombre completo: "pp lafuente". Usuario principal o de pruebas. |
| `test_strong` | `Usuario1.` | Sí | Usuario creado durante las pruebas de la API (Backend). |

> **Nota sobre el primer inicio de sesión:**
> Como hemos configurado la opción de "Obligar a cambiar la contraseña", la primera vez que intentes acceder a un cliente Linux/Windows unido al dominio con estos usuarios, el sistema te pedirá que introduzcas una nueva contraseña inmediatamente.
