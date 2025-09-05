const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'sourabh161@',
  database: process.env.DB_NAME || 'leave_application_system',
};

async function updateStudentNames() {
  try {
    const connection = await mysql.createConnection(dbConfig);

    console.log('Updating student names in database...');

    // Update student names based on USN
    const updates = [
      { usn: '4PM22CG001', name: 'Rushidhar', email: 'rushidhar@university.edu' },
      { usn: '4PM22CG002', name: 'Metigouda', email: 'gouda@university.edu' },
      { usn: '4PM22CG003', name: 'Anil', email: 'anil@university.edu' },
      { usn: 'CS2023001', name: 'Sourabh Patil', email: 'sourabh@example.com' }
    ];

    for (const student of updates) {
      await connection.execute(
        'UPDATE students SET name = ?, email = ? WHERE usn = ?',
        [student.name, student.email, student.usn]
      );
      console.log(`Updated ${student.usn}: ${student.name}`);
    }

    console.log('Student names updated successfully!');

    // Verify the updates
    const [rows] = await connection.execute('SELECT id, usn, name, email FROM students ORDER BY id');
    console.log('\nUpdated students:');
    rows.forEach(student => {
      console.log(`- ${student.usn}: ${student.name} (${student.email})`);
    });

    await connection.end();
    console.log('\nDatabase update completed!');
  } catch (error) {
    console.error('Error updating student names:', error);
  }
}

// Run the update
updateStudentNames();