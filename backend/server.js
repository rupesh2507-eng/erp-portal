require("dotenv").config();

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {

    const authHeader = req.headers["authorization"];

    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Access token required"
        });
    }

    jwt.verify(
        token,
        process.env.JWT_SECRET,
        (err, user) => {

            if (err) {
                return res.status(403).json({
                    success: false,
                    message: "Invalid or expired token"
                });
            }

            req.user = user;

            next();
        }
    );
};

const bcrypt = require("bcrypt");

const Razorpay = require("razorpay");
const crypto = require("crypto");

const { Resend } = require("resend");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const resend = new Resend(process.env.RESEND_API_KEY);
const otpStore = new Map();

const db = require("./db");

// ================= AUTOMATIC FEE BREAKDOWN =================
async function createFeeBreakdown(studentId, totalFee) {
    try {
        // Check whether fee breakdown already exists
        const [existing] = await db.query(
            "SELECT id FROM fee_breakdown WHERE student_id = ? LIMIT 1",
            [studentId]
        );

        // Don't create duplicate fee breakdown
        if (existing.length > 0) {
            return;
        }

        // Default fee structure
        const tuitionFee = 60000;
        const hostelFee = 20000;
        const examinationFee = 5000;

        // Make sure the fee structure matches the student's total fee
        if (tuitionFee + hostelFee + examinationFee !== Number(totalFee)) {
            console.log(
                `Fee breakdown not created for student ${studentId}: total fee structure does not match`
            );
            return;
        }

        await db.query(
            `INSERT INTO fee_breakdown
            (student_id, fee_type, total_amount, paid_amount)
            VALUES
            (?, 'Tuition Fees', ?, 0),
            (?, 'Hostel Fees', ?, 0),
            (?, 'Examination Fees', ?, 0)`,
            [
                studentId, tuitionFee,
                studentId, hostelFee,
                studentId, examinationFee
            ]
        );

        console.log(`Fee breakdown created for student ${studentId}`);
    } catch (error) {
        console.error("Fee breakdown creation error:", error);
    }
}

const studentRoutes = require("./routes/studentRoutes");

const app = express();

console.log("USING UPDATED SERVER.JS");

const PORT = process.env.PORT || 5000;

// ==============================
// MIDDLEWARE
// ==============================

// Allow frontend to communicate with backend
app.use(cors());

// Read JSON data
app.use(express.json());


// ==============================
// STUDENT ROUTES
// ==============================

app.use("/student", studentRoutes);


// ==============================
// HOME ROUTE
// ==============================

app.get("/", (req, res) => {

    res.send(
        "Student ERP Backend is running!"
    );

});


// ==============================
// TEST DATABASE
// ==============================

app.get("/test-db", (req, res) => {

    db.query(
        "SELECT 1",
        (err) => {

            if (err) {

                console.error(err);

                return res
                    .status(500)
                    .send(
                        "Database connection failed!"
                    );

            }

            res.send(
                "Database connected successfully!"
            );

        }
    );

});


// ==============================
// STUDENT LOGIN
// ==============================

app.post("/login", (req, res) => {

    const { email, password } = req.body;

    const sql = `
        SELECT
            id,
            name,
            email,
            password,
            roll_no,
            course,
            semester,
            phone,
            DATE_FORMAT(dob, '%d/%m/%Y') AS dob,
            gender,
            section,
            department,
            session
        FROM students
        WHERE email = ?
    `;

    db.query(sql, [email], async (err, results) => {

        if (err) {
            console.error("Login error:", err.message);

            return res.status(500).json({
                success: false,
                message: "Server error"
            });
        }

        if (results.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const student = results[0];

        const passwordMatch = await bcrypt.compare(
            password,
            student.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Never send the password/hash to the frontend
        delete student.password;

        const activitySql = `
            INSERT INTO login_activity (student_id)
            VALUES (?)
        `;

        db.query(
            activitySql,
            [student.id],
            (activityErr) => {

                if (activityErr) {
                    console.error(
                        "Login activity error:",
                        activityErr.message
                    );
                }

                const token = jwt.sign(
                    {
                        id: student.id,
                        email: student.email
                    },
                    process.env.JWT_SECRET,
                    {
                        expiresIn: "1h"
                    }
                );

                res.json({
                    success: true,
                    message: "Login successful",
                    token: token,
                    student: student
                });

            }
        );

    });

});

// ==============================
// LOGIN ACTIVITY
// ==============================

app.get("/login-activity/:studentId", authenticateToken, (req, res) => {

    const studentId = req.params.studentId;

    if (Number(studentId) !== Number(req.user.id)) {
        return res.status(403).json({
            success: false,
            message: "Access denied"
        });
    }

    const sql = `
        SELECT
            login_time
        FROM login_activity
        WHERE student_id = ?
        ORDER BY login_time DESC
        LIMIT 10
    `;

    db.query(sql, [studentId], (err, results) => {

        if (err) {
            console.error(
                "Login activity error:",
                err.message
            );

            return res.status(500).json({
                success: false,
                message: "Server error"
            });
        }

        res.json({
            success: true,
            activities: results
        });

    });

});


// ==============================
// ATTENDANCE
// ==============================

app.get("/attendance/:studentId", authenticateToken, (req, res) => {

    const studentId = req.params.studentId;

    if (Number(studentId) !== Number(req.user.id)) {
        return res.status(403).json({
            success: false,
            message: "Access denied"
        });
    }

    const sql = `
        SELECT
            a.course_id,
            c.subject_code,
            c.subject_name,
            a.attended,
            a.total
        FROM attendance a
        JOIN course_master c
            ON a.course_id = c.id
        WHERE a.student_id = ?
        ORDER BY c.id
    `;

    db.query(sql, [studentId], (err, results) => {

        if (err) {
            console.error(
                "Attendance error:",
                err.message
            );

            return res.status(500).json({
                success: false,
                message: "Server error"
            });
        }

        res.json({
            success: true,
            attendance: results
        });

    });

});

// ================= DEMO PUNCH GENERATOR =================
// ================= DEMO PUNCH GENERATOR =================
function generateDemoPunchRecords(studentId, selectedDate, callback) {

    // Only generate demo data for Priyanshu
    if (Number(studentId) !== 2) {
        return callback();
    }

    const today = new Date();
    const targetDate = new Date(selectedDate + "T00:00:00");
    const startDate = new Date("2026-09-04T00:00:00");

    // Never generate future records
    if (targetDate > today || targetDate < startDate) {
        return callback();
    }

    // Holidays
    const holidays = [
        "2026-09-05",
        "2026-09-06",
        "2026-09-12",
        "2026-09-13",
        "2026-09-19",
        "2026-09-20",
        "2026-09-26",
        "2026-09-27",
        "2026-10-03",
        "2026-10-04"
    ];

    if (holidays.includes(selectedDate)) {
        return callback();
    }

    // Check if records already exist
    db.query(
        `SELECT id
         FROM punch_records
         WHERE student_id = ?
         AND punch_date = ?
         LIMIT 1`,
        [studentId, selectedDate],
        (err, existing) => {

            if (err) {
                console.error("Demo punch check error:", err.message);
                return callback(err);
            }

            if (existing.length > 0) {
                return callback();
            }

            // Get timetable for this day
            const dayName = new Date(
                selectedDate + "T00:00:00"
            ).toLocaleDateString("en-US", {
                weekday: "long"
            });

            db.query(
                `SELECT
                    subject,
                    start_time,
                    end_time,
                    room
                 FROM timetable_master
                 WHERE department = ?
                 AND semester = ?
                 AND section = ?
                 AND day = ?
                 ORDER BY start_time`,
                [
                    "Computer Applications",
                    3,
                    "J",
                    dayName
                ],
                (err, classes) => {

                    if (err) {
                        console.error(
                            "Demo timetable error:",
                            err.message
                        );
                        return callback(err);
                    }

                    if (classes.length === 0) {
                        return callback();
                    }

                    let completed = 0;
                    let hasError = false;

                    classes.forEach((classItem) => {

                        // Around 85% Present, 15% Absent
                        const isPresent = Math.random() < 0.85;

                        let status = "Absent";
                        let punchIn = null;

                        if (isPresent) {

                            status = "Present";

                            const startTime =
                                classItem.start_time
                                    .toString()
                                    .substring(0, 8);

                            const [hours, minutes] =
                                startTime
                                    .split(":")
                                    .map(Number);

                            const earlyMinutes =
                                Math.floor(
                                    Math.random() * 11
                                ) + 5;

                            const punchDate = new Date(
                                2000,
                                0,
                                1,
                                hours,
                                minutes
                            );

                            punchDate.setMinutes(
                                punchDate.getMinutes()
                                - earlyMinutes
                            );

                            const hh = String(
                                punchDate.getHours()
                            ).padStart(2, "0");

                            const mm = String(
                                punchDate.getMinutes()
                            ).padStart(2, "0");

                            const ss = String(
                                Math.floor(
                                    Math.random() * 50
                                )
                            ).padStart(2, "0");

                            punchIn =
                                `${hh}:${mm}:${ss}`;
                        }

                        db.query(
                            `INSERT INTO punch_records
                            (
                                student_id,
                                punch_date,
                                subject,
                                start_time,
                                end_time,
                                room,
                                punch_in,
                                status
                            )
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                            [
                                studentId,
                                selectedDate,
                                classItem.subject,
                                classItem.start_time,
                                classItem.end_time,
                                classItem.room,
                                punchIn,
                                status
                            ],
                            (err) => {

                                if (err) {
                                    console.error(
                                        "Demo punch insert error:",
                                        err.message
                                    );
                                    hasError = true;
                                }

                                completed++;

                                if (
                                    completed ===
                                    classes.length
                                ) {
                                    callback(
                                        hasError
                                            ? new Error(
                                                "Demo punch generation failed"
                                            )
                                            : null
                                    );
                                }
                            }
                        );
                    });
                }
            );
        }
    );
}


// ==============================
// DAILY PUNCH
// ==============================

app.get("/punch/:studentId", authenticateToken, async (req, res) => {

    const studentId = req.params.studentId;
    const date = req.query.date;

    if (Number(studentId) !== Number(req.user.id)) {
        return res.status(403).json({
            success: false,
            message: "Access denied"
        });
    }


    const sql = `
        SELECT
            tm.subject,

            DATE_FORMAT(
                tm.start_time,
                '%h:%i %p'
            ) AS start_time,

            DATE_FORMAT(
                tm.end_time,
                '%h:%i %p'
            ) AS end_time,

            tm.room,

            IF(
                p.punch_in IS NULL,
                '--',
                DATE_FORMAT(
                    p.punch_in,
                    '%h:%i %p'
                )
            ) AS punch_in,

            CASE
                WHEN p.status IS NOT NULL
                    THEN p.status

                WHEN ? < CURDATE()
                    THEN 'Absent'

                WHEN ? = CURDATE()
                     AND CONCAT(?, ' ', tm.end_time) < NOW()
                    THEN 'Absent'

                ELSE 'Not Marked'
            END AS status

        FROM students s

        JOIN timetable_master tm
            ON tm.department = s.department
            AND tm.semester = s.semester
            AND tm.section = s.section

        LEFT JOIN punch_records p
            ON p.student_id = s.id
            AND p.punch_date = ?
            AND p.subject = tm.subject

        WHERE s.id = ?

        AND tm.day = DAYNAME(?)

        ORDER BY tm.start_time
    `;

    generateDemoPunchRecords(studentId, date, (generatorError) => {

    if (generatorError) {
        return res.status(500).json({
            success: false,
            message: "Failed to generate punch records"
        });
    }

    db.query(
        sql,
        [
            date,
            date,
            date,
            date,
            studentId,
            date
        ],
        (err, results) => {

            if (err) {
                console.error(
                    "Punch error:",
                    err.message
                );

                return res.status(500).json({
                    success: false,
                    message: "Server error"
                });
            }

            res.json({
                success: true,
                punch: results
            });

        }
    );

});

});

// ==============================
// COURSES
// ==============================

app.get("/courses/:studentId", authenticateToken, (req, res) => {

    const studentId = req.params.studentId;

    if (Number(studentId) !== Number(req.user.id)) {
        return res.status(403).json({
            success: false,
            message: "Access denied"
        });
    }

    const sql = `
        SELECT
            cm.id,
            cm.subject_code,
            cm.subject_name,
            cm.credits
        FROM students s
        JOIN course_master cm
            ON cm.department = s.department
            AND cm.semester = s.semester
        WHERE s.id = ?
        ORDER BY cm.id
    `;

    db.query(sql, [studentId], (err, results) => {

        if (err) {
            console.error(
                "Courses error:",
                err.message
            );

            return res.status(500).json({
                success: false,
                message: "Server error"
            });
        }

        res.json({
            success: true,
            courses: results
        });

    });

});


// ==============================
// TIMETABLE
// ==============================

app.get("/timetable/:studentId", authenticateToken, (req, res) => {

    const studentId = req.params.studentId;

    if (Number(studentId) !== Number(req.user.id)) {
        return res.status(403).json({
            success: false,
            message: "Access denied"
        });
    }

    const sql = `
        SELECT
            tm.day,
            tm.subject,
            tm.start_time,
            tm.end_time,
            tm.room
        FROM students s
        JOIN timetable_master tm
            ON tm.department = s.department
            AND tm.semester = s.semester
            AND tm.section = s.section
        WHERE s.id = ?
        ORDER BY
            FIELD(
                tm.day,
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
                'Sunday'
            ),
            tm.start_time
    `;

    db.query(sql, [studentId], (err, results) => {

        if (err) {
            console.error(
                "Timetable error:",
                err.message
            );

            return res.status(500).json({
                success: false,
                message: "Server error"
            });
        }

        res.json({
            success: true,
            timetable: results
        });

    });

});


// ==============================
// RESULTS
// ==============================

app.get("/results/:studentId", authenticateToken, (req, res) => {

    const studentId = req.params.studentId;

    if (Number(studentId) !== Number(req.user.id)) {
        return res.status(403).json({
            success: false,
            message: "Access denied"
        });
    }

    const sql = `
        SELECT
            subject,
            marks,
            max_marks,
            grade
        FROM results
        WHERE student_id = ?
        ORDER BY id
    `;

    db.query(sql, [studentId], (err, results) => {

        if (err) {
            console.error(
                "Results error:",
                err.message
            );

            return res.status(500).json({
                success: false,
                message: "Server error"
            });
        }

        res.json({
            success: true,
            results: results
        });

    });

});

// ==============================
// FEES
// ==============================

app.get("/fees/:studentId", authenticateToken, (req, res) => {

    const studentId = req.params.studentId;

    if (Number(studentId) !== Number(req.user.id)) {
        return res.status(403).json({
            success: false,
            message: "Access denied"
        });
    }

    const sql = `
        SELECT
            total_fee,
            paid_fee,
            due_fee
        FROM fees
        WHERE student_id = ?
    `;

    db.query(sql, [studentId], (err, results) => {

        if (err) {
            console.error(
                "Fees error:",
                err.message
            );

            return res.status(500).json({
                success: false,
                message: "Server error"
            });
        }

        if (!results.length) {
            return res.json({
                success: true,
                fees: null
            });
        }

        const fee = results[0];

        const totalFee = Number(fee.total_fee) || 0;
        const dueFee = Number(fee.due_fee) || 0;

        /*
         * Calculate paid amount from
         * Total Fee - Due Fee.
         *
         * This prevents the progress from
         * becoming 100% while some fee is pending.
         */
        const paidFee = Math.max(
            totalFee - dueFee,
            0
        );

        res.json({
            success: true,
            fees: {
                total_fee: totalFee,
                paid_fee: paidFee,
                due_fee: dueFee
            }
        });

    });

});


// ==============================
// NOTICES
// ==============================

app.get("/notices", (req, res) => {

    const sql = `
        SELECT
            id,
            title,
            message,
            category,
            created_at
        FROM notices
        ORDER BY created_at DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error(
                "Notices error:",
                err.message
            );

            return res.status(500).json({
                success: false,
                message: "Server error"
            });
        }

        res.json({
            success: true,
            notices: results
        });

    });

});


// ==============================
// CHANGE PASSWORD
// ==============================

app.put(
    "/change-password/:studentId",
    authenticateToken,
    async (req, res) => {

        const studentId = req.params.studentId;

        const {
            currentPassword,
            newPassword
        } = req.body;

        if (Number(studentId) !== Number(req.user.id)) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password and new password are required"
            });
        }

        const checkSql = `
            SELECT password
            FROM students
            WHERE id = ?
        `;

        db.query(
            checkSql,
            [studentId],
            async (err, results) => {

                if (err) {
                    console.error(
                        "Password check error:",
                        err.message
                    );

                    return res.status(500).json({
                        success: false,
                        message: "Server error"
                    });
                }

                if (results.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "Student not found"
                    });
                }

                const passwordMatch =
                    await bcrypt.compare(
                        currentPassword,
                        results[0].password
                    );

                if (!passwordMatch) {
                    return res.status(401).json({
                        success: false,
                        message: "Current password is incorrect"
                    });
                }

                const hashedPassword =
                    await bcrypt.hash(
                        newPassword,
                        10
                    );

                const updateSql = `
                    UPDATE students
                    SET password = ?
                    WHERE id = ?
                `;

                db.query(
                    updateSql,
                    [
                        hashedPassword,
                        studentId
                    ],
                    (err) => {

                        if (err) {
                            console.error(
                                "Password update error:",
                                err.message
                            );

                            return res.status(500).json({
                                success: false,
                                message: "Unable to update password"
                            });
                        }

                        res.json({
                            success: true,
                            message: "Password changed successfully"
                        });

                    }
                );

            }
        );

    }
);


// ==============================
// FEE BREAKDOWN
// ==============================

app.get(
    "/fee-breakdown/:studentId",
    authenticateToken,
    (req, res) => {

        const studentId = req.params.studentId;

        if (Number(studentId) !== Number(req.user.id)) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        const sql = `
            SELECT
                fee_type,
                total_amount,
                paid_amount,
                (total_amount - paid_amount) AS pending_amount
            FROM fee_breakdown
            WHERE student_id = ?
            ORDER BY id
        `;

        db.query(
            sql,
            [studentId],
            (err, results) => {

                if (err) {
                    console.error(
                        "Fee breakdown error:",
                        err.message
                    );

                    return res.status(500).json({
                        success: false,
                        message: "Server error"
                    });
                }

                res.json({
                    success: true,
                    breakdown: results
                });

            }
        );

    }
);


// ==============================
// PAYMENT HISTORY
// ==============================

app.get(
    "/payment-history/:studentId",
    authenticateToken,
    (req, res) => {

        const studentId = req.params.studentId;

        if (Number(studentId) !== Number(req.user.id)) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        const sql = `
            SELECT
                transaction_id,
                DATE_FORMAT(
                    payment_date,
                    '%d %b %Y'
                ) AS payment_date,
                fee_type,
                amount,
                status
            FROM payment_history
            WHERE student_id = ?
            ORDER BY payment_date DESC
        `;

        db.query(
            sql,
            [studentId],
            (err, results) => {

                if (err) {
                    console.error(
                        "Payment history error:",
                        err.message
                    );

                    return res.status(500).json({
                        success: false,
                        message: "Server error"
                    });
                }

                res.json({
                    success: true,
                    payments: results
                });

            }
        );

    }
);

// ==============================
// CREATE PAYMENT ORDER
// ==============================

app.post(
    "/payment/create-order",
    authenticateToken,
    async (req, res) => {

        try {

            // Always use the logged-in student's ID
            const studentId = Number(req.user.id);

            // Amount selected by the student
            const requestedAmount =
                Number(req.body.amount);

            if (!Number.isFinite(requestedAmount)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid payment amount"
                });
            }

            if (!Number.isInteger(requestedAmount)) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Payment amount must be a whole number"
                });
            }

            if (requestedAmount <= 0) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Payment amount must be greater than ₹0"
                });
            }


            // ==============================
            // GET CURRENT PENDING FEE
            // ==============================

            const feeSql = `
                SELECT
                    total_fee,
                    paid_fee,
                    due_fee
                FROM fees
                WHERE student_id = ?
            `;

            const feeResults =
                await new Promise((resolve, reject) => {

                    db.query(
                        feeSql,
                        [studentId],
                        (err, results) => {

                            if (err) {
                                reject(err);
                            } else {
                                resolve(results);
                            }

                        }
                    );

                });


            if (feeResults.length === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Fee record not found"
                });

            }


            const currentDue =
                Number(feeResults[0].due_fee);


            if (currentDue <= 0) {

                return res.status(400).json({
                    success: false,
                    message:
                        "No pending fees available"
                });

            }


            // ==============================
            // MINIMUM PAYMENT VALIDATION
            // ==============================

            if (currentDue >= 1000) {

                if (requestedAmount < 1000) {

                    return res.status(400).json({
                        success: false,
                        message:
                            "Minimum payment amount is ₹1,000"
                    });

                }

            } else {

                // If pending amount is below ₹1,000,
                // student can pay any amount from ₹1
                // up to the pending amount.

                if (requestedAmount < 1) {

                    return res.status(400).json({
                        success: false,
                        message:
                            "Minimum payment amount is ₹1"
                    });

                }

            }


            // ==============================
            // NEVER ALLOW OVERPAYMENT
            // ==============================

            if (requestedAmount > currentDue) {

                return res.status(400).json({
                    success: false,
                    message:
                        `Payment cannot exceed the pending amount of ₹${currentDue.toLocaleString("en-IN")}`
                });

            }


            // ==============================
            // CREATE RAZORPAY ORDER
            // ==============================

            const options = {

                amount:
                    Math.round(
                        requestedAmount * 100
                    ),

                currency: "INR",

                receipt:
                    "receipt_" + Date.now()

            };


            try {

                const order =
                    await razorpay.orders.create(
                        options
                    );


                res.json({

                    success: true,

                    order_id:
                        order.id,

                    amount:
                        order.amount,

                    currency:
                        order.currency,

                    key_id:
                        process.env.RAZORPAY_KEY_ID

                });

            } catch (razorpayError) {

                console.error(
                    "Razorpay order error:",
                    razorpayError
                );

                res.status(500).json({

                    success: false,

                    message:
                        "Unable to create Razorpay order"

                });

            }

        } catch (error) {

            console.error(
                "Payment order error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Unable to create payment order"

            });

        }

    }
);


// ==============================
// VERIFY PAYMENT
// ==============================

app.post(
    "/payment/verify",
    authenticateToken,
    async (req, res) => {

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        // Student ID comes securely from JWT
        const studentId = Number(req.user.id);

        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment details"
            });
        }

        try {

            // --------------------------------------------------
            // 1. Fetch Razorpay order
            // --------------------------------------------------

            const order = await razorpay.orders.fetch(
                razorpay_order_id
            );

            const paymentAmount = Number(order.amount) / 100;

            if (
                !Number.isFinite(paymentAmount) ||
                paymentAmount <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid payment amount"
                });
            }


            // --------------------------------------------------
            // 2. Check current pending fee
            // --------------------------------------------------

            const feeSql = `
                SELECT
                    total_fee,
                    paid_fee,
                    due_fee
                FROM fees
                WHERE student_id = ?
            `;

            const feeResults = await new Promise(
                (resolve, reject) => {

                    db.query(
                        feeSql,
                        [studentId],
                        (err, results) => {

                            if (err) {
                                reject(err);
                            } else {
                                resolve(results);
                            }

                        }
                    );

                }
            );

            if (feeResults.length === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Fee record not found"
                });

            }

            const currentDue =
                Number(feeResults[0].due_fee);


            // --------------------------------------------------
            // 3. Validate payment amount
            // --------------------------------------------------

            if (paymentAmount < 1) {

                return res.status(400).json({
                    success: false,
                    message: "Minimum payment amount is ₹1"
                });

            }

            if (
                currentDue >= 1000 &&
                paymentAmount < 1000
            ) {

                return res.status(400).json({
                    success: false,
                    message: "Minimum payment amount is ₹1,000"
                });

            }

            if (paymentAmount > currentDue) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Payment amount is greater than pending fees"
                });

            }


            // --------------------------------------------------
            // 4. Verify Razorpay signature
            // --------------------------------------------------

            const generatedSignature =
                crypto
                    .createHmac(
                        "sha256",
                        process.env.RAZORPAY_KEY_SECRET
                    )
                    .update(
                        razorpay_order_id +
                        "|" +
                        razorpay_payment_id
                    )
                    .digest("hex");


            if (
                generatedSignature !==
                razorpay_signature
            ) {

                return res.status(400).json({
                    success: false,
                    message: "Payment verification failed"
                });

            }


            // --------------------------------------------------
            // 5. Start MySQL transaction
            // --------------------------------------------------

            db.beginTransaction(
                (transactionErr) => {

                    if (transactionErr) {

                        console.error(
                            "Transaction error:",
                            transactionErr
                        );

                        return res.status(500).json({
                            success: false,
                            message: "Payment processing failed"
                        });

                    }


                    // ------------------------------------------
                    // Lock student's fee record
                    // ------------------------------------------

                    const feeLockSql = `
                        SELECT
                            total_fee,
                            paid_fee,
                            due_fee
                        FROM fees
                        WHERE student_id = ?
                        FOR UPDATE
                    `;

                    db.query(
                        feeLockSql,
                        [studentId],
                        (feeErr, feeRows) => {

                            if (feeErr) {

                                return db.rollback(() => {

                                    console.error(
                                        "Fee lock error:",
                                        feeErr
                                    );

                                    res.status(500).json({
                                        success: false,
                                        message:
                                            "Payment processing failed"
                                    });

                                });

                            }


                            if (feeRows.length === 0) {

                                return db.rollback(() => {

                                    res.status(404).json({
                                        success: false,
                                        message:
                                            "Fee record not found"
                                    });

                                });

                            }


                            const lockedFee =
                                feeRows[0];

                            const lockedDue =
                                Number(
                                    lockedFee.due_fee
                                );


                            // ----------------------------------
                            // Prevent overpayment
                            // ----------------------------------

                            if (
                                paymentAmount >
                                lockedDue
                            ) {

                                return db.rollback(() => {

                                    res.status(400).json({
                                        success: false,
                                        message:
                                            "Payment amount is greater than pending fees"
                                    });

                                });

                            }


                            // ----------------------------------
                            // Get pending fee breakdown
                            // ----------------------------------

                            const breakdownSql = `
                                SELECT
                                    id,
                                    fee_type,
                                    total_amount,
                                    paid_amount,
                                    (total_amount - paid_amount)
                                        AS pending_amount
                                FROM fee_breakdown
                                WHERE student_id = ?
                                AND (total_amount - paid_amount) > 0
                                ORDER BY id
                                FOR UPDATE
                            `;

                            db.query(
                                breakdownSql,
                                [studentId],
                                (breakdownErr, breakdownRows) => {

                                    if (breakdownErr) {

                                        return db.rollback(() => {

                                            console.error(
                                                "Breakdown error:",
                                                breakdownErr
                                            );

                                            res.status(500).json({
                                                success: false,
                                                message:
                                                    "Payment processing failed"
                                            });

                                        });

                                    }


                                    if (
                                        breakdownRows.length === 0
                                    ) {

                                        return db.rollback(() => {

                                            res.status(400).json({
                                                success: false,
                                                message:
                                                    "No pending fee breakdown found"
                                            });

                                        });

                                    }


                                    // --------------------------------
                                    // Allocate payment
                                    // --------------------------------

                                    let remainingPayment =
                                        paymentAmount;

                                    let index = 0;


                                    function updateNextFee() {

                                        if (
                                            remainingPayment <= 0 ||
                                            index >=
                                            breakdownRows.length
                                        ) {

                                            return updateOverallFees();

                                        }


                                        const feeItem =
                                            breakdownRows[index];

                                        const pendingAmount =
                                            Number(
                                                feeItem.pending_amount
                                            );

                                        const amountToPay =
                                            Math.min(
                                                remainingPayment,
                                                pendingAmount
                                            );


                                        const updateSql = `
                                            UPDATE fee_breakdown
                                            SET paid_amount =
                                                paid_amount + ?
                                            WHERE id = ?
                                        `;


                                        db.query(
                                            updateSql,
                                            [
                                                amountToPay,
                                                feeItem.id
                                            ],
                                            (updateErr) => {

                                                if (updateErr) {

                                                    return db.rollback(() => {

                                                        console.error(
                                                            "Breakdown update error:",
                                                            updateErr
                                                        );

                                                        res.status(500).json({
                                                            success: false,
                                                            message:
                                                                "Payment processing failed"
                                                        });

                                                    });

                                                }


                                                remainingPayment -=
                                                    amountToPay;

                                                index++;

                                                updateNextFee();

                                            }
                                        );

                                    }


                                    // --------------------------------
                                    // Update overall fees
                                    // --------------------------------

                                    function updateOverallFees() {

                                        const updateFeeSql = `
                                            UPDATE fees
                                            SET
                                                paid_fee = paid_fee + ?,
                                                due_fee = due_fee - ?
                                            WHERE student_id = ?
                                        `;


                                        db.query(
                                            updateFeeSql,
                                            [
                                                paymentAmount,
                                                paymentAmount,
                                                studentId
                                            ],
                                            (updateFeeErr) => {

                                                if (updateFeeErr) {

                                                    return db.rollback(() => {

                                                        console.error(
                                                            "Overall fee update error:",
                                                            updateFeeErr
                                                        );

                                                        res.status(500).json({
                                                            success: false,
                                                            message:
                                                                "Payment processing failed"
                                                        });

                                                    });

                                                }


                                                // ----------------------------
                                                // Save payment history
                                                // ----------------------------

                                                const historySql = `
                                                    INSERT INTO payment_history
                                                    (
                                                        student_id,
                                                        transaction_id,
                                                        fee_type,
                                                        amount,
                                                        status
                                                    )
                                                    VALUES
                                                    (
                                                        ?,
                                                        ?,
                                                        'Fee Payment',
                                                        ?,
                                                        'Paid'
                                                    )
                                                `;


                                                db.query(
                                                    historySql,
                                                    [
                                                        studentId,
                                                        razorpay_payment_id,
                                                        paymentAmount
                                                    ],
                                                    (historyErr) => {

                                                        if (historyErr) {

                                                            return db.rollback(() => {

                                                                console.error(
                                                                    "Payment history error:",
                                                                    historyErr
                                                                );

                                                                res.status(500).json({
                                                                    success: false,
                                                                    message:
                                                                        "Payment processing failed"
                                                                });

                                                            });

                                                        }


                                                        // ------------------------
                                                        // Commit everything
                                                        // ------------------------

                                                        db.commit(
                                                            (commitErr) => {

                                                                if (commitErr) {

                                                                    return db.rollback(() => {

                                                                        console.error(
                                                                            "Commit error:",
                                                                            commitErr
                                                                        );

                                                                        res.status(500).json({
                                                                            success: false,
                                                                            message:
                                                                                "Payment processing failed"
                                                                        });

                                                                    });

                                                                }


                                                                res.json({
                                                                    success: true,
                                                                    message:
                                                                        "Payment successful",
                                                                    amount:
                                                                        paymentAmount
                                                                });

                                                            }
                                                        );

                                                    }
                                                );

                                            }
                                        );

                                    }


                                    updateNextFee();

                                }
                            );

                        }
                    );

                }
            );

        } catch (error) {

            console.error(
                "Payment verification error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Payment verification failed"
            });

        }

    }
);

// ==============================
// FORGOT PASSWORD - SEND OTP
// ==============================

app.post("/forgot-password/send-otp", async (req, res) => {

    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            success: false,
            message: "Email is required"
        });
    }

    const sql = `
        SELECT id, name, email
        FROM students
        WHERE email = ?
    `;

    db.query(sql, [email], async (err, results) => {

        if (err) {
            console.error(
                "Forgot password error:",
                err.message
            );

            return res.status(500).json({
                success: false,
                message: "Server error"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Email is not registered"
            });
        }

        const student = results[0];

        const otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        const expiresAt =
            Date.now() + 5 * 60 * 1000;

        otpStore.set(email, {
            otp: otp,
            expiresAt: expiresAt,
            studentId: student.id
        });

        try {

            const { data, error } =
                await resend.emails.send({

                    from:
                        "Student ERP <onboarding@resend.dev>",

                    to: [email],

                    subject:
                        "Student ERP Password Reset OTP",

                    html: `
                        <h2>Student ERP Portal</h2>

                        <p>Hello ${student.name},</p>

                        <p>
                            Your password reset OTP is:
                        </p>

                        <h1>${otp}</h1>

                        <p>
                            This OTP is valid for 5 minutes.
                        </p>

                        <p>
                            If you did not request a password reset,
                            please ignore this email.
                        </p>
                    `
                });

            if (error) {

                console.error(
                    "Resend error:",
                    error
                );

                otpStore.delete(email);

                return res.status(500).json({
                    success: false,
                    message: "Unable to send OTP"
                });
            }

            console.log(
                "OTP sent to:",
                email
            );

            res.json({
                success: true,
                message: "OTP sent successfully"
            });

        } catch (error) {

            console.error(
                "OTP email error:",
                error
            );

            otpStore.delete(email);

            res.status(500).json({
                success: false,
                message: "Unable to send OTP"
            });
        }

    });

});


// ==============================
// FORGOT PASSWORD - VERIFY OTP
// ==============================

app.post(
    "/forgot-password/verify-otp",
    (req, res) => {

        const {
            email,
            otp
        } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required"
            });
        }

        const storedData =
            otpStore.get(email);

        if (!storedData) {
            return res.status(400).json({
                success: false,
                message: "OTP not found or expired"
            });
        }

        if (
            Date.now() >
            storedData.expiresAt
        ) {

            otpStore.delete(email);

            return res.status(400).json({
                success: false,
                message: "OTP has expired"
            });
        }

        if (storedData.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        storedData.verified = true;

        otpStore.set(
            email,
            storedData
        );

        res.json({
            success: true,
            message: "OTP verified successfully"
        });

    }
);


// ==============================
// FORGOT PASSWORD - RESET
// ==============================

app.post(
    "/forgot-password/reset-password",
    async (req, res) => {

        const {
            email,
            newPassword
        } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({
                success: false,
                message:
                    "Email and new password are required"
            });
        }

        const storedData =
            otpStore.get(email);

        if (
            !storedData ||
            !storedData.verified
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Please verify OTP first"
            });
        }

        if (
            Date.now() >
            storedData.expiresAt
        ) {

            otpStore.delete(email);

            return res.status(400).json({
                success: false,
                message: "OTP has expired"
            });
        }

        const hashedPassword =
            await bcrypt.hash(
                newPassword,
                10
            );

        const sql = `
            UPDATE students
            SET password = ?
            WHERE id = ?
        `;

        db.query(
            sql,
            [
                hashedPassword,
                storedData.studentId
            ],
            (err, result) => {

                if (err) {
                    console.error(
                        "Password reset error:",
                        err.message
                    );

                    return res.status(500).json({
                        success: false,
                        message:
                            "Unable to reset password"
                    });
                }

                if (
                    result.affectedRows === 0
                ) {
                    return res.status(404).json({
                        success: false,
                        message:
                            "Student not found"
                    });
                }

                // Remove OTP after successful reset
                otpStore.delete(email);

                res.json({
                    success: true,
                    message:
                        "Password reset successfully"
                });

            }
        );

    }
);

// =====================================================
// MASTER STUDENT DATA API
// Automatically returns data for the logged-in student
// =====================================================

app.get("/student-data", authenticateToken, async (req, res) => {

    const studentId = req.user.id;

    try {

        const query = (sql, values = []) => {
            return new Promise((resolve, reject) => {

                db.query(sql, values, (err, results) => {

                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve(results);

                });

            });
        };


        // ==============================
        // STUDENT PROFILE
        // ==============================

        const studentResult = await query(
            `
            SELECT
                id,
                name,
                email,
                roll_no,
                course,
                semester,
                phone,
                DATE_FORMAT(dob, '%d/%m/%Y') AS dob,
                gender,
                section,
                department,
                session,
                profile_picture
            FROM students
            WHERE id = ?
            `,
            [studentId]
        );


        if (studentResult.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Student not found"
            });

        }


        // ==============================
        // ATTENDANCE
        // ==============================

        const attendance = await query(
            `
            SELECT
                a.course_id,
                c.subject_code,
                c.subject_name,
                a.attended,
                a.total
            FROM attendance a
            JOIN course_master c
                ON a.course_id = c.id
            WHERE a.student_id = ?
            ORDER BY c.id
            `,
            [studentId]
        );


        // ==============================
        // COURSES
        // ==============================

        const courses = await query(
            `
            SELECT
                cm.subject_code,
                cm.subject_name,
                cm.credits
            FROM students s
            JOIN course_master cm
                ON cm.department = s.department
                AND cm.semester = s.semester
            WHERE s.id = ?
            ORDER BY cm.id
            `,
            [studentId]
        );


        // ==============================
        // TIMETABLE
        // ==============================

        const timetable = await query(
            `
            SELECT
                tm.day,
                tm.subject,
                DATE_FORMAT(tm.start_time, '%h:%i %p') AS start_time,
                DATE_FORMAT(tm.end_time, '%h:%i %p') AS end_time,
                tm.room
            FROM students s
            JOIN timetable_master tm
                ON tm.department = s.department
                AND tm.semester = s.semester
                AND tm.section = s.section
            WHERE s.id = ?
            ORDER BY
                FIELD(
                    tm.day,
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                    'Saturday',
                    'Sunday'
                ),
                tm.start_time
            `,
            [studentId]
        );


        // ==============================
        // RESULTS
        // ==============================

        const results = await query(
            `
            SELECT
                subject,
                marks,
                max_marks,
                grade
            FROM results
            WHERE student_id = ?
            ORDER BY id
            `,
            [studentId]
        );


        // ==============================
        // FEES
        // ==============================

        const feesResult = await query(
            `
            SELECT
                total_fee,
                paid_fee,
                due_fee
            FROM fees
            WHERE student_id = ?
            `,
            [studentId]
        );


        // ==============================
        // FEE BREAKDOWN
        // ==============================

        const feeBreakdown = await query(
            `
            SELECT
                fee_type,
                total_amount,
                paid_amount,
                (total_amount - paid_amount) AS pending_amount
            FROM fee_breakdown
            WHERE student_id = ?
            ORDER BY id
            `,
            [studentId]
        );


        // ==============================
        // PAYMENT HISTORY
        // ==============================

        const paymentHistory = await query(
            `
            SELECT
                transaction_id,
                DATE_FORMAT(payment_date, '%d %b %Y') AS payment_date,
                fee_type,
                amount,
                status
            FROM payment_history
            WHERE student_id = ?
            ORDER BY payment_date DESC
            `,
            [studentId]
        );


        // ==============================
        // NOTICES
        // ==============================

        const notices = await query(
            `
            SELECT *
            FROM notices
            ORDER BY id DESC
            LIMIT 10
            `
        );


        // ==============================
        // SEND EVERYTHING
        // ==============================

        res.json({

            success: true,

            student: studentResult[0],

            attendance: attendance,

            courses: courses,

            timetable: timetable,

            results: results,

            fees: feesResult.length > 0
                ? feesResult[0]
                : null,

            feeBreakdown: feeBreakdown,

            paymentHistory: paymentHistory,

            notices: notices

        });

    } catch (error) {

        console.error(
            "Master student data error:",
            error.message
        );

        res.status(500).json({

            success: false,

            message: "Unable to load student data"

        });

    }

});

app.get("/hostel/:studentId", authenticateToken, (req, res) => {

    const studentId = req.params.studentId;

    // Student can only access their own hostel details
    if (Number(studentId) !== Number(req.user.id)) {
        return res.status(403).json({
            success: false,
            message: "Access denied"
        });
    }

    const hostelSql = `
        SELECT
            id,
            hostel_name,
            block,
            room_number,
            bed_number,
            floor,
            room_type,
            session,
            DATE_FORMAT(allocation_date, '%d %M %Y') AS allocation_date,
            status
        FROM hostel_allocations
        WHERE student_id = ?
    `;

    db.query(hostelSql, [studentId], (err, hostelResults) => {

        if (err) {
            console.error("Hostel error:", err.message);

            return res.status(500).json({
                success: false,
                message: "Server error"
            });
        }

        // No hostel allocated
        if (hostelResults.length === 0) {
            return res.json({
                success: true,
                allocated: false,
                hostel: null,
                roommates: []
            });
        }

        const hostel = hostelResults[0];

        const roommateSql = `
            SELECT
                student_name,
                department,
                bed_number
            FROM hostel_roommates
            WHERE hostel_id = ?
            ORDER BY id
        `;

        db.query(
            roommateSql,
            [hostel.id],
            (roommateErr, roommateResults) => {

                if (roommateErr) {
                    console.error(
                        "Hostel roommates error:",
                        roommateErr.message
                    );

                    return res.status(500).json({
                        success: false,
                        message: "Server error"
                    });
                }

                res.json({
                    success: true,
                    allocated: true,
                    hostel: hostel,
                    roommates: roommateResults
                });

            }
        );

    });

});

// ================= PROFILE UPDATE =================
app.put("/student/:studentId", authenticateToken, async (req, res) => {
    try {
        const studentId = Number(req.params.studentId);

        // Student can update only their own profile
        if (req.user.id !== studentId) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        const { name, email, phone } = req.body;

        if (!name || !email || !phone) {
            return res.status(400).json({
                success: false,
                message: "Name, email and phone are required"
            });
        }

        // Check whether email already belongs to another student
        const [existing] = await db.query(
            "SELECT id FROM students WHERE email = ? AND id != ?",
            [email, studentId]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Email already belongs to another student"
            });
        }

        await db.query(
            `UPDATE students
             SET name = ?, email = ?, phone = ?
             WHERE id = ?`,
            [name, email, phone, studentId]
        );

        const [rows] = await db.query(
            `SELECT
                id,
                name,
                email,
                roll_no,
                course,
                semester,
                phone,
                DATE_FORMAT(dob, '%d/%m/%Y') AS dob,
                gender,
                section,
                department,
                session
             FROM students
             WHERE id = ?`,
            [studentId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        res.json({
            success: true,
            message: "Profile updated successfully",
            student: rows[0]
        });

    } catch (error) {
        console.error("Profile update error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

// ==============================
// START SERVER
// ==============================

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `Server running on port ${PORT}`
        );

    }
);
