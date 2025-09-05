const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'sourabh161@',
  database: process.env.DB_NAME || 'leave_application_system',
};

// Function to calculate CGPA from semester percentages
function calculateCGPA(semesterData) {
  // Convert percentage to GPA (assuming 10-point scale)
  // GPA = (percentage / 10) + 0.5 adjustment for realistic values
  const gpa = (parseFloat(semesterData) / 10) + 0.5;

  // Ensure GPA is within 4.0-10.0 range
  return Math.min(Math.max(gpa, 4.0), 10.0);
}

// Student data with corrected CGPA calculations
const studentUpdates = [
  { usn: '4PM22CG001', name: 'Aditya S', cgpa: 8.21 },
  { usn: '4PM22CG002', name: 'Aiman Baig', cgpa: 7.48 },
  { usn: '4PM22CG003', name: 'Akshay V', cgpa: 7.50 },
  { usn: '4PM22CG004', name: 'Ananya K', cgpa: 8.76 },
  { usn: '4PM22CG005', name: 'Arpitha R', cgpa: 8.50 },
  { usn: '4PM22CG006', name: 'Arpitha S', cgpa: 7.96 },
  { usn: '4PM22CG007', name: 'Bhoomika R', cgpa: 8.37 },
  { usn: '4PM22CG010', name: 'Chandana CS', cgpa: 8.60 },
  { usn: '4PM22CG012', name: 'Darshan S', cgpa: 8.00 },
  { usn: '4PM22CG014', name: 'Deekshitha R', cgpa: 6.98 },
  { usn: '4PM22CG015', name: 'Gopika E L', cgpa: 7.97 },
  { usn: '4PM22CG018', name: 'Hithaishi U', cgpa: 7.50 },
  { usn: '4PM22CG021', name: 'Kartik Gopal Madivala', cgpa: 8.20 },
  { usn: '4PM22CG022', name: 'Kruthika B I', cgpa: 8.53 },
  { usn: '4PM22CG024', name: 'Meghana K M', cgpa: 7.45 },
  { usn: '4PM22CG027', name: 'Nishant', cgpa: 7.30 },
  { usn: '4PM22CG028', name: 'NISHANTH K R', cgpa: 7.51 },
  { usn: '4PM22CG029', name: 'Nithin A B', cgpa: 8.70 },
  { usn: '4PM22CG030', name: 'Nivedita Shankar Gouda', cgpa: 7.00 },
  { usn: '4PM22CG031', name: 'Padmini V', cgpa: 7.90 },
  { usn: '4PM22CG032', name: 'Poornashree SV', cgpa: 8.40 },
  { usn: '4PM22CG034', name: 'Prerana Ashok Raikar', cgpa: 8.33 },
  { usn: '4PM22CG035', name: 'Priya Y M', cgpa: 7.97 },
  { usn: '4PM22CG036', name: 'ROHAN K RAJOLI', cgpa: 6.79 },
  { usn: '4PM22CG037', name: 'Sachin K', cgpa: 6.00 },
  { usn: '4PM22CG038', name: 'Sakshi S Y', cgpa: 7.90 },
  { usn: '4PM22CG040', name: 'SHADABUR RAHAMAN', cgpa: 8.71 },
  { usn: '4PM22CG041', name: 'Shamanth S Kumbar', cgpa: 6.76 },
  { usn: '4PM22CG042', name: 'Shankar', cgpa: 8.69 },
  { usn: '4PM22CG044', name: 'Shivshankar Ajit Awate', cgpa: 7.61 },
  { usn: '4PM22CG045', name: 'Shreya Janardhan Madival', cgpa: 8.79 },
  { usn: '4PM22CG046', name: 'Sinchana NS', cgpa: 8.35 },
  { usn: '4PM22CG047', name: 'Sourabh Patil', cgpa: 8.84 },
  { usn: '4PM22CG048', name: 'Srushti GP', cgpa: 8.01 },
  { usn: '4PM22CG049', name: 'Srushti N Y', cgpa: 7.50 },
  { usn: '4PM22CG051', name: 'Supritha GC', cgpa: 8.25 },
  { usn: '4PM22CG052', name: 'Suraj V', cgpa: 8.69 },
  { usn: '4PM22CG053', name: 'Sushma KV', cgpa: 7.93 },
  { usn: '4PM22CG054', name: 'Sushmitha M J', cgpa: 8.00 },
  { usn: '4PM22CG056', name: 'Thoofik Usmaan A', cgpa: 7.50 },
  { usn: '4PM22CG058', name: 'Uday P', cgpa: 6.00 },
  { usn: '4PM22CG059', name: 'Vaishnavi G K', cgpa: 7.60 },
  { usn: '4PM22CG060', name: 'Vanishree M', cgpa: 8.70 },
  { usn: '4PM22CG061', name: 'Varsha S', cgpa: 7.58 }
];

async function updateStudentCGPA() {
  try {
    const connection = await mysql.createConnection(dbConfig);

    console.log('Updating student CGPA and semester information...');

    // Update each student's CGPA and semester
    for (const student of studentUpdates) {
      await connection.execute(
        'UPDATE students SET cgpa = ?, semester = 7 WHERE usn = ?',
        [student.cgpa, student.usn]
      );
      console.log(`✓ Updated ${student.name} (${student.usn}): CGPA ${student.cgpa}, Semester 7`);
    }

    // Update leave balances for 7th semester
    await connection.execute('UPDATE leave_balances SET semester = 7 WHERE semester = 6');

    // Update semester performance records
    await connection.execute('UPDATE semester_performance SET semester = 7 WHERE semester = 6');

    console.log('\n🎉 CGPA and semester updates completed successfully!');
    console.log('\n📊 Updated:');
    console.log('  • 44 students with accurate CGPA values');
    console.log('  • All students moved to 7th semester');
    console.log('  • Leave balances updated for 7th semester');
    console.log('  • Semester performance records updated');

    // Verify the updates
    const [students] = await connection.execute(
      'SELECT usn, name, cgpa, semester FROM students ORDER BY cgpa DESC LIMIT 5'
    );

    console.log('\n🏆 Top 5 CGPA Students:');
    students.forEach((student, index) => {
      console.log(`${index + 1}. ${student.name} (${student.usn}): ${student.cgpa} CGPA`);
    });

    await connection.end();

  } catch (error) {
    console.error('❌ Error updating student data:', error);
    process.exit(1);
  }
}

// Run the update
updateStudentCGPA();