const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkEmails() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'eduleave'
    });

    console.log('📧 STUDENT EMAILS:');
    const [students] = await connection.execute('SELECT usn, name, email FROM students WHERE email IS NOT NULL');
    if (students.length === 0) {
      console.log('  No student emails found');
    } else {
      students.forEach(student => {
        console.log(`  USN: ${student.usn} | Name: ${student.name} | Email: ${student.email}`);
      });
    }

    console.log('\n📧 HOD EMAILS:');
    const [hods] = await connection.execute('SELECT eid, name, email FROM hod WHERE email IS NOT NULL');
    if (hods.length === 0) {
      console.log('  No HOD emails found');
    } else {
      hods.forEach(hod => {
        console.log(`  EID: ${hod.eid} | Name: ${hod.name} | Email: ${hod.email}`);
      });
    }

    console.log('\n💡 TIP: Use the exact email address shown above for password reset');

  } catch (error) {
    console.error('❌ Error checking emails:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkEmails();
