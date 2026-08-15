"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchLdap = exports.getAdminClient = exports.BASE_DN = exports.BIND_DN = void 0;
const ldapjs_1 = __importDefault(require("ldapjs"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../../.env') });
const AD_DOMAIN = process.env.AD_DOMAIN || 'corp.local';
const AD_PASSWORD = process.env.AD_PASSWORD || 'SuperSegura2026!';
const LDAP_URL = 'ldaps://127.0.0.1:636';
exports.BIND_DN = `administrator@${AD_DOMAIN}`;
exports.BASE_DN = AD_DOMAIN.split('.').map(dc => `dc=${dc}`).join(',');
/**
 * Crea y devuelve un cliente LDAP ya autenticado (Bound) como Administrador.
 * Utiliza promesas para facilitar async/await.
 */
const getAdminClient = () => {
    return new Promise((resolve, reject) => {
        const client = ldapjs_1.default.createClient({
            url: LDAP_URL,
            tlsOptions: { rejectUnauthorized: false }
        });
        client.bind(exports.BIND_DN, AD_PASSWORD, (err) => {
            if (err) {
                client.unbind();
                return reject(err);
            }
            resolve(client);
        });
    });
};
exports.getAdminClient = getAdminClient;
/**
 * Utilidad genérica para ejecutar búsquedas LDAP envueltas en Promesas
 */
const searchLdap = (client, base, options) => {
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
exports.searchLdap = searchLdap;
