const { UserService } = require('./src/services/ldap/user.service');

async function test() {
  try {
    console.log('Testing delete user...');
    await UserService.deleteUserByCN('pp2 lafuente');
    console.log('Success DELETE!');
  } catch (e) {
    console.error('Error DELETE:', e.message);
  }
}

test();
