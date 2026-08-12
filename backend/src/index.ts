import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ldap from 'ldapjs';
import path from 'path';

// Carga las variables de entorno desde el archivo .env en la raíz del proyecto
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const PORT = process.env.API_PORT || 3000;

app.use(cors());
app.use(express.json());

// Credenciales del AD desde el .env
const AD_DOMAIN = process.env.AD_DOMAIN || 'corp.local';
const AD_PASSWORD = process.env.AD_PASSWORD || 'SuperSegura2026!';

// El usuario administrador por defecto en Samba4 / AD
const bindDN = `administrator@${AD_DOMAIN}`;
const bindPassword = AD_PASSWORD;
const ldapUrl = 'ldaps://127.0.0.1:636';

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

app.listen(PORT, () => {
  console.log(`Servidor Backend corriendo en http://localhost:${PORT}`);
  console.log(`Prueba el endpoint de estado en: http://localhost:${PORT}/api/status`);
});
