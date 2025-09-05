const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'sourabh161@',
  database: process.env.DB_NAME || 'leave_application_system',
};

async function checkDatabaseData() {
  try {
    const connection = await mysql.createConnection(dbConfig);

    console.log('Checking database data...\n');

    // Check students table
    console.log('=== STUDENTS TABLE ===');
    const [students] = await connection.execute('SELECT id, usn, name, password FROM students LIMIT 5');
    console.log('Found', students.length, 'students:');
    students.forEach(student => {
      console.log(`- ID: ${student.id}, USN: ${student.usn}, Name: ${student.name}, Password: ${student.password}`);
    });

    // Check HOD table
    console.log('\n=== HOD TABLE ===');
    const [hods] = await connection.execute('SELECT id, eid, name, password FROM hod LIMIT 5');
    console.log('Found', hods.length, 'HODs:');
    hods.forEach(hod => {
      console.log(`- ID: ${hod.id}, EID: ${hod.eid}, Name: ${hod.name}, Password: ${hod.password}`);
    });

    // Test specific queries
    console.log('\n=== TESTING SPECIFIC QUERIES ===');

    // Test student lookup
    const [studentTest] = await connection.execute('SELECT * FROM students WHERE usn = ?', ['4PM22CG001']);
    console.log('Student lookup test (4PM22CG001):', studentTest.length > 0 ? 'FOUND' : 'NOT FOUND');
    if (studentTest.length > 0) {
      console.log('Student data:', studentTest[0]);
    }

    // Test HOD lookup
    const [hodTest] = await connection.execute('SELECT * FROM hod WHERE eid = ?', ['HOD001']);
    console.log('HOD lookup test (HOD001):', hodTest.length > 0 ? 'FOUND' : 'NOT FOUND');
    if (hodTest.length > 0) {
      console.log('HOD data:', hodTest[0]);
    }

    await connection.end();
    console.log('\nDatabase check completed!');
  } catch (error) {
    console.error('Error checking database:', error);
  }
}

// Run the check
checkDatabaseData();