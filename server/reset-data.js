const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const readline = require('readline');

const dbPath = path.join(__dirname, 'data', 'urea_pacs.db');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🗑️  UREA PACS Data Reset Tool');
console.log('================================');
console.log('This will permanently delete ALL farmers and orders data.');
console.log('Database location:', dbPath);
console.log('');

rl.question('Are you sure you want to reset all data? Type "YES" to confirm: ', (answer) => {
  if (answer !== 'YES') {
    console.log('❌ Operation cancelled.');
    rl.close();
    return;
  }

  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('❌ Error opening database:', err.message);
      rl.close();
      return;
    }

    console.log('📊 Connected to SQLite database.');
    
    // Get counts before deletion
    db.get('SELECT COUNT(*) as count FROM farmers', (err, farmersRow) => {
      if (err) {
        console.error('❌ Error counting farmers:', err.message);
        return;
      }

      db.get('SELECT COUNT(*) as count FROM orders', (err, ordersRow) => {
        if (err) {
          console.error('❌ Error counting orders:', err.message);
          return;
        }

        const farmersCount = farmersRow?.count || 0;
        const ordersCount = ordersRow?.count || 0;

        console.log(`📈 Current data: ${farmersCount} farmers, ${ordersCount} orders`);
        console.log('');

        if (farmersCount === 0 && ordersCount === 0) {
          console.log('✅ Database is already empty. Nothing to reset.');
          db.close();
          rl.close();
          return;
        }

        // Clear all data
        db.serialize(() => {
          db.run('DELETE FROM orders', (err) => {
            if (err) {
              console.error('❌ Error deleting orders:', err.message);
              return;
            }
            console.log('🗑️  Deleted all orders');
          });

          db.run('DELETE FROM farmers', (err) => {
            if (err) {
              console.error('❌ Error deleting farmers:', err.message);
              return;
            }
            console.log('🗑️  Deleted all farmers');
          });

          // Reset auto-increment counters
          db.run('DELETE FROM sqlite_sequence WHERE name IN ("farmers", "orders")', (err) => {
            if (err) {
              console.error('❌ Error resetting sequences:', err.message);
              return;
            }
            console.log('🔄 Reset ID sequences');
          });

          // Verify deletion
          db.get('SELECT COUNT(*) as farmers_count FROM farmers', (err, farmersRow) => {
            if (err) {
              console.error('❌ Error verifying farmers deletion:', err.message);
              return;
            }

            db.get('SELECT COUNT(*) as orders_count FROM orders', (err, ordersRow) => {
              if (err) {
                console.error('❌ Error verifying orders deletion:', err.message);
                return;
              }

              console.log('');
              console.log('✅ Data reset complete!');
              console.log(`📊 Final count: ${ordersRow?.orders_count || 0} farmers, ${farmersRow?.farmers_count || 0} orders`);
              console.log('');
              console.log('💡 You can now restart the PACS application with fresh data.');

              db.close((err) => {
                if (err) {
                  console.error('❌ Error closing database:', err.message);
                } else {
                  console.log('📊 Database connection closed.');
                }
                rl.close();
              });
            });
          });
        });
      });
    });
  });
});