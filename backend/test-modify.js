import { getAdminClient } from './src/services/ldap/ldap.client';
import ldap from 'ldapjs';
import dotenv from 'dotenv';
dotenv.config();
async function test() {
    const client = await getAdminClient();
    const cn = 'pp lafuente';
    const userDN = `CN=${cn},CN=Users,DC=corp,DC=local`;
    const change = new ldap.Change({
        operation: 'replace',
        modification: {
            userAccountControl: '544'
        }
    });
    client.modify(userDN, change, (err) => {
        client.unbind();
        if (err) {
            console.error('ERROR EN MODIFY STATUS:', err);
        }
        else {
            console.log('STATUS CAMBIADO OK');
        }
    });
}
test();
