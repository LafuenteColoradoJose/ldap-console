import ldap from 'ldapjs';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
const AD_DOMAIN = process.env.AD_DOMAIN || 'corp.local';
const AD_PASSWORD = process.env.AD_PASSWORD || 'SuperSegura2026!';
const LDAP_URL = 'ldaps://127.0.0.1:636';
export const BIND_DN = `administrator@${AD_DOMAIN}`;
export const BASE_DN = AD_DOMAIN.split('.').map(dc => `dc=${dc}`).join(',');
/**
 * Crea y devuelve un cliente LDAP ya autenticado (Bound) como Administrador.
 * Utiliza promesas para facilitar async/await.
 */
export const getAdminClient = () => {
    return new Promise((resolve, reject) => {
        const client = ldap.createClient({
            url: LDAP_URL,
            tlsOptions: { rejectUnauthorized: false }
        });
        client.bind(BIND_DN, AD_PASSWORD, (err) => {
            if (err) {
                client.unbind();
                return reject(err);
            }
            resolve(client);
        });
    });
};
/**
 * Utilidad genérica para ejecutar búsquedas LDAP envueltas en Promesas
 */
export const searchLdap = (client, base, options) => {
    return new Promise((resolve, reject) => {
        client.search(base, options, (err, res) => {
            if (err)
                return reject(err);
            const entries = [];
            res.on('searchEntry', (entry) => {
                entries.push(entry.pojo);
            });
            res.on('error', (err) => {
                reject(err);
            });
            res.on('end', () => {
                resolve(entries);
            });
        });
    });
};
