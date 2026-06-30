const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");

const app = express();

app.use(express.json());

app.use(cors({
    origin: "http://localhost:5173"
    // Idan ka deploy frontend, ka maye gurbin wannan da URL ɗinsa.
}));

let db;

// Connect to MySQL
async function connectDB() {
    try {
        db = await mysql.createConnection(
            "mysql://root:PDGSxJXaIQOWeKVqrGhIUiPbuZuAwwNo@reseau.proxy.rlwy.net:33677/railway"
        );

        console.log("✅ Database connected");
    } catch (error) {
        console.error("❌ Database connection failed:", error.message);
        process.exit(1);
    }
}

// Home Route
app.get("/", (req, res) => {
    res.send("Backend is running...");
});

// Register User
app.post("/api", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save to database
        const sql = "INSERT INTO users (email, password) VALUES (?, ?)";

        const [result] = await db.query(sql, [
            email,
            hashedPassword
        ]);

        res.status(201).json({
            message: "User saved successfully",
            id: result.insertId
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Internal Server Error"
        });
    }
});

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
});










// mysql://root:PDGSxJXaIQOWeKVqrGhIUiPbuZuAwwNo@reseau.proxy.rlwy.net:33677/railway
