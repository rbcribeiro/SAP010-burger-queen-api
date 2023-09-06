const { execSync } = require('child_process');

try {
  execSync('node index.js', { stdio: 'inherit' });
  execSync('npx sequelize-cli db:migrate', { stdio: 'inherit' });
} catch (error) {
  console.error('Erro ao executar migrações ou index.js:', error);
  process.exit(1);
}

