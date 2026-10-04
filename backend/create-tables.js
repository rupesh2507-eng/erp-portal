const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Shagun.@.2507",
    database: "student_erp"
});

connection.connect((err) => {
    if (err) {
        console.error("MySQL connection failed:", err.message);
        return;
    }

    console.log("Connected to student_erp database!");

    const queries = [

        // Students table
        `CREATE TABLE IF NOT EXISTS students (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            roll_no VARCHAR(50) UNIQUE,
            course VARCHAR(100),
            semester INT,
            phone VARCHAR(20),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,

        // Attendance table
        `CREATE TABLE IF NOT EXISTS attendance (
            id INT AUTO_INCREMENT PRIMARY KEY,
            student_id INT NOT NULL,
            subject VARCHAR(100) NOT NULL,
            attended INT DEFAULT 0,
            total INT DEFAULT 0,
            FOREIGN KEY (student_id) REFERENCES students(id)
        )`,

        // Courses table
        `CREATE TABLE IF NOT EXISTS courses (
            id INT AUTO_INCREMENT PRIMARY KEY,
            student_id INT NOT NULL,
            subject_code VARCHAR(50),
            subject_name VARCHAR(100) NOT NULL,
            FOREIGN KEY (student_id) REFERENCES students(id)
        )`,

        // Fees table
        `CREATE TABLE IF NOT EXISTS fees (
            id INT AUTO_INCREMENT PRIMARY KEY,
            student_id INT NOT NULL,
            total_fee DECIMAL(10,2) DEFAULT 0,
            paid_fee DECIMAL(10,2) DEFAULT 0,
            due_fee DECIMAL(10,2) DEFAULT 0,
            FOREIGN KEY (student_id) REFERENCES students(id)
        )`,

        // Notices table
        `CREATE TABLE IF NOT EXISTS notices (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            message TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`

    ];

    let completed = 0;

    queries.forEach((query) => {
        connection.query(query, (err) => {

            if (err) {
                console.error("Table creation failed:", err.message);
                return;
            }

            completed++;

            if (completed === queries.length) {
                console.log("All ERP tables created successfully!");
                connection.end();
            }
        });
    });
});