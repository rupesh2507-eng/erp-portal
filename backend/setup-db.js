const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Shagun.@.2507"
});

connection.connect((err) => {
    if (err) {
        console.error("MySQL connection failed:", err.message);
        return;
    }

    console.log("Connected to MySQL!");

    connection.query(
        "CREATE DATABASE IF NOT EXISTS student_erp",
        (err) => {
            if (err) {
                console.error("Database creation failed:", err.message);
                return;
            }

            console.log("student_erp database created successfully!");
            connection.end();
        }
    );
});