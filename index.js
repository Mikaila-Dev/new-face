const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();

app.use(express.json());

app.use(cors({
    origin: "http://localhost:5173"
}));

let db;

// Connect Database
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

        const sql = "INSERT INTO users (email, password) VALUES (?, ?)";

        const [result] = await db.query(sql, [email, password]);

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

// Get All Users
app.get("/users", async (req, res) => {
    try {
        const [users] = await db.query("SELECT * FROM users");

        res.status(200).json(users);

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
