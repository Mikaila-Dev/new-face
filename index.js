const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");

const app = express();

app.use(express.json());
app.use(cors());

let db;

async function connectDB() {
    try {
        db = await mysql.createConnection(
            process.env.DATABASE_URL
        );

        console.log("MySQL Connected!");

        await db.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(100) NOT NULL,
                password VARCHAR(255) NOT NULL
            )
        `);

        console.log("Table Created!");
    } catch (error) {
        console.error("Database Error:", error);
        process.exit(1);
    }
}

app.post("/api", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).send("All fields are required");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.execute(
            "INSERT INTO users (username, password) VALUES (?, ?)",
            [username, hashedPassword]
        );

        res.send("Successful");
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

app.get("/api/admin", async (req, res) => {
    try {
        const [rows] = await db.execute(
            "SELECT id, username FROM users"
        );

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

const PORT = process.env.PORT || 5001;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});