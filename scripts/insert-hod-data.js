const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'sourabh161@',
  database: process.env.DB_NAME || 'leave_application_system',
};

async function insertHODData() {
  try {
    const connection = await mysql.createConnection(dbConfig);

    console.log('Inserting HOD data...');

    // Insert HOD data
    await connection.execute(`
      INSERT INTO hod (eid, name, email, password, department) VALUES
      ('HOD001', 'Dr. Smith', 'smith.hod@university.edu', '123456', 'Computer Science & Design')
    `);

    console.log('HOD data inserted successfully!');

    // Verify the insertion
    const [hods] = await connection.execute('SELECT * FROM hod');
    console.log('HODs in database:', hods.length);
    hods.forEach(hod => {
      console.log(`- EID: ${hod.eid}, Name: ${hod.name}, Password: ${hod.password}`);
    });

    await connection.end();
    console.log('HOD data insertion completed!');
  } catch (error) {
    console.error('Error inserting HOD data:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('HOD data already exists.');
    }
  }
}

// Run the insertion
insertHODData();