const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkHODPasswords() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'eduleave'
    });

    console.log('🔐 HOD ACCOUNTS:');
    const [hods] = await connection.execute('SELECT eid, name, password FROM hod');
    if (hods.length === 0) {
      console.log('  No HOD accounts found');
    } else {
      hods.forEach(hod => {
        console.log(`  EID: ${hod.eid} | Name: ${hod.name} | Password: ${hod.password}`);
      });
    }

    console.log('\n💡 TIP: Use these credentials to test HOD password reset functionality');

  } catch (error) {
    console.error('❌ Error checking HOD passwords:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkHODPasswords();
