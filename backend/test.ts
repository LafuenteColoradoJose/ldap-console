import { UserService } from './src/services/ldap/user.service';

async function test() {
  try {
    console.log('Testing create user with weak password...');
    await UserService.createUser('test_weak', 'test', 'weak', 'weak@corp.local', '.........', true);
    console.log('Success weak!');
  } catch (e: any) {
    console.error('Error weak:', e.message);
  }

  try {
    console.log('Testing create user with strong password...');
    await UserService.createUser('test_strong', 'test', 'strong', 'strong@corp.local', 'Hola12345!', true);
    console.log('Success strong!');
  } catch (e: any) {
    console.error('Error strong:', e.message);
  }
}

test();
