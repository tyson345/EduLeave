# EduLeave

A comprehensive leave management system for educational institutions, allowing students to apply for leave and HODs to manage applications.

## Features

- Student leave application form with support for full-day and half-day leave
- Leave balance tracking (10 days per semester)
- Special leave request functionality for students out of leave
- File upload for supporting documents
- HOD dashboard for leave application approvals
- Leave history tracking
- SQL database integration

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MySQL
- **ORM**: mysql2 (with connection pooling)

## Prerequisites

- Node.js (v18 or higher)
- MySQL database
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd eduleave
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up MySQL:
   - Install MySQL on your system if not already installed
   - Start the MySQL service
   - Create a MySQL user with appropriate permissions

4. Set up the database:
   - Update the `.env` file with your database credentials:
     ```
     DB_HOST=localhost
     DB_PORT=3306
     DB_USER=your_db_username
     DB_PASSWORD=your_actual_password_here
     DB_NAME=eduleave
     ```
   - Run the database initialization script:
     ```bash
     npm run init-db
     ```

5. Configure environment variables:
   ```bash
   # Copy the example env file
   cp .env.example .env
   ```

   Update the values in `.env` with your configuration:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=your_db_username
   DB_PASSWORD=your_db_password
   DB_NAME=eduleave
   ```

## Database Schema

The database schema is defined in `database/schema.sql` and includes:

- `students` table for student information
- `leave_balances` table for tracking leave balances
- `leave_applications` table for leave applications
- `special_leave_requests` table for special leave requests

## Project Structure

```
├── app/                    # Next.js 14 app directory
│   ├── hod/               # HOD dashboard pages
│   ├── apply-leave/       # Leave application form
│   ├── request-leave/     # Special leave request form
│   ├── leave-history/     # Leave history pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Student dashboard
├── database/              # Database schema
├── lib/                   # Database connection and utilities
├── public/                # Static assets
├── scripts/               # Database initialization script
└── styles/                # Global styles
```

## Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:3000`

## Usage

### For Students

1. Access the student dashboard at the root URL
2. Apply for leave using the "Apply for Leave" button
3. View leave history using the "View Leave History" button
4. If out of leave balance, use the "Request Additional Leave" option

### For HOD

1. Access the HOD dashboard at `/hod`
2. Review pending leave applications
3. Approve or reject applications
4. View approved leave history

## API Routes

- `/api/apply-leave` - Submit leave applications
- `/api/request-leave` - Submit special leave requests
- `/api/leave-history` - Get leave history for a student
- `/api/hod/pending` - Get pending leave applications
- `/api/hod/approved` - Get approved leave applications

## Troubleshooting

If you encounter the "Failed to fetch student information" error:

1. Make sure your MySQL database is running
2. Verify your database credentials in the `.env` file
3. Ensure you have run the database initialization script:
   ```bash
   npm run init-db
   ```
4. Check the console logs for more detailed error messages

If you get a database connection error when running `npm run init-db`:

1. Make sure MySQL is installed and running on your system
2. Verify your database credentials in the `.env` file
3. Check that the MySQL service is active:
   - On Windows: `net start mysql` or check Services
   - On macOS: `brew services start mysql` or check Activity Monitor
   - On Linux: `sudo systemctl start mysql`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with Next.js and TypeScript
- Styled with Tailwind CSS
- Database connectivity with mysql2