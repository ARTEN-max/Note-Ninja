import migrateUsernames from './migrateUsernames.js';

const runMigration = async () => {
  console.log('Starting migration process...');
  await migrateUsernames();
  console.log('Migration process completed.');
  process.exit(0);
};

runMigration().catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
}); 