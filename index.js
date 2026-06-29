const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");

const app = express();

app.use(express.json());
// app.use(cors());

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

        console.log("Database Connected!");

    } catch (error) {
        console.error(error);
    }
}

// Home
app.get("/", (req, res) => {
    res.send("Server Running");
});

// Register User
app.post("/api", async (req, res) => {
    try {
        const { name, password } = req.body;

        if (!name || !password) {
            return res.status(400).send("All fields are required");
        }

        // Check existing user
        const [user] = await db.execute(
            "SELECT * FROM users WHERE name = ?",
            [name]
        );

        if (user.length > 0) {
            return res.status(400).send("User already exists");
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save user
        await db.execute(
            "INSERT INTO users (name, password) VALUES (?, ?)",
            [name, hashedPassword]
        );

        res.send("User saved successfully");

    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
});

// Get users
app.get("/api/admin", async (req, res) => {
    try {
        const [rows] = await db.execute(
            "SELECT id, name FROM users"
        );

        res.json(rows);

    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
});

// Show table structure
app.get("/table", async (req, res) => {
    try {
        const [rows] = await db.execute(
            "DESCRIBE users"
        );

        res.json(rows);

    } catch (error) {
        res.status(500).send(error.message);
    }
});

// connectDB().then(() => {
//     app.listen(3000, () => {
//         console.log("Server running on port 3000");
//     });
// });

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});