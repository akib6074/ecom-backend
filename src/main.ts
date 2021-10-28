import { exec } from 'child_process';

Promise.all([
  exec("pm2 start -f dist/be-user/main.js --name 'test-user'"),
]).then(() => {
  console.log('Server is starting. Please wait for pm2 response!');
});
