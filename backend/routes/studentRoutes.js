const express = require("express");
const db = require("../db");
const authenticateToken = require("../authMiddleware");

const router = express.Router();

// ==============================
// UPDATE STUDENT PROFILE
// ==============================

router.put("/:id", authenticateToken, (req, res) => {

    const studentId = req.params.id;

    // Student can update only their own profile
    if (Number(studentId) !== Number(req.user.id)) {
        return res.status(403).json({
            success: false,
            message: "Access denied"
        });
    }

    const {
        name,
        email,
        phone,
        address
    } = req.body;

    if (!name || !email || !phone) {
        return res.status(400).json({
            success: false,
            message: "Name, email and phone are required"
        });
    }

    const sql = `
        UPDATE students
        SET
            name = ?,
            email = ?,
            phone = ?,
            address = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [
            name,
            email,
            phone,
            address || "",
            studentId
        ],
        (err, result) => {

            if (err) {
                console.error(
                    "Profile update error:",
                    err.message
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to update profile"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Student not found"
                });
            }

            const getStudentSql = `
                SELECT
                    id,
                    name,
                    email,
                    roll_no,
                    course,
                    semester,
                    phone,
                    address,
                    dob,
                    gender,
                    section,
                    department,
                    session
                FROM students
                WHERE id = ?
            `;

            db.query(
                getStudentSql,
                [studentId],
                (err, results) => {

                    if (err) {
                        console.error(
                            "Fetch updated profile error:",
                            err.message
                        );

                        return res.status(500).json({
                            success: false,
                            message:
                                "Profile updated but failed to fetch updated data"
                        });
                    }

                    res.json({
                        success: true,
                        message: "Profile updated successfully",
                        student: results[0]
                    });

                }
            );
        }
    );
});



router.get("/all", (req, res) => {

    const sql = `
        SELECT
            id,
            name,
            email,
            role,
            roll_no,
            course,
            semester,
            phone,
            gender,
            section,
            department,
            session,
            address
        FROM students
        ORDER BY id ASC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error(
                "Fetch students error:",
                err.message
            );

            return res.status(500).json({
                success: false,
                message: "Unable to fetch students"
            });
        }

        res.json({
            success: true,
            students: results
        });
    });
});

module.exports = router;