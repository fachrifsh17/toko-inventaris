const bcrypt = require('bcrypt');
const password = 'admin123'; // Ganti dengan password pilihan Anda

bcrypt.hash(password, 10).then(hash => {
  console.log('--- HASIL HASH ---');
  console.log(hash);
  console.log('------------------');
});