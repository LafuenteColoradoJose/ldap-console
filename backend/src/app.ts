import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ldap from 'ldapjs';
import path from 'path';
import jwt from 'jsonwebtoken';

// Carga las variables de entorno desde el archivo .env en la raíz del proyecto
// En un entorno de testing, podemos querer mockear esto
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();

app.use(cors());
app.use(express.json());

// Credenciales del AD desde el .env
const AD_DOMAIN = process.env.AD_DOMAIN || 'corp.local';
const AD_PASSWORD = process.env.AD_PASSWORD || 'SuperSegura2026!';
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-2026';

// El usuario administrador por defecto en Samba4 / AD
const bindDN = `administrator@${AD_DOMAIN}`;
const bindPassword = AD_PASSWORD;
const ldapUrl = 'ldaps://127.0.0.1:636';

/**
 * Endpoint de estado para comprobar la conectividad con el servidor LDAP local
 */
app.get('/api/status', (req: Request, res: Response) => {
  const client = ldap.createClient({
    url: ldapUrl,
    tlsOptions: {
      rejectUnauthorized: false // Permite certificados autofirmados locales de Samba
    }
  });

  client.on('error', (err) => {
    console.error('LDAP Client Error:', err.message);
  });

  client.bind(bindDN, bindPassword, (err) => {
    if (err) {
      console.error('LDAP Bind Error:', err.message);
      client.unbind();
      return res.status(500).json({
        status: 'error',
        message: 'Error al autenticarse en el servidor LDAP',
        error: err.message
      });
    }

    console.log('LDAP Bind exitoso.');
    client.unbind();
    
    return res.json({
      status: 'success',
      message: 'Conexión y autenticación (bind) con Active Directory LDAP exitosa!',
      domain: AD_DOMAIN
    });
  });
});

/**
 * Endpoint de Login (Autenticación contra Active Directory)
 */
app.post('/api/auth/login', (req: Request, res: Response): any => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ status: 'error', message: 'Se requieren usuario y contraseña' });
  }

  const client = ldap.createClient({
    url: ldapUrl,
    tlsOptions: { rejectUnauthorized: false }
  });

  // Normalizar el username. Si no incluye dominio, se lo añadimos
  const bindUser = username.includes('@') ? username : `${username}@${AD_DOMAIN}`;

  client.bind(bindUser, password, (err) => {
    client.unbind(); // Siempre cerramos la conexión

    if (err) {
      console.warn(`Intento de login fallido para: ${bindUser}`);
      return res.status(401).json({ status: 'error', message: 'Credenciales inválidas' });
    }

    // Login exitoso: firmamos un token JWT
    const token = jwt.sign({ username: bindUser }, JWT_SECRET, { expiresIn: '8h' });

    console.log(`Login exitoso: ${bindUser}`);
    return res.json({
      status: 'success',
      token,
      user: { username: bindUser }
    });
  });
});

export default app;
