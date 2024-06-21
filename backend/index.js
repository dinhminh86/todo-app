
const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2/promise");

const app = express();
app.use(bodyParser.json());

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  //port: "3306",
};

let connection;

const connectToDatabase = async () => {
  if (!connection) {
    connection = await mysql.createConnection(dbConfig);
  }
  return connection;
};

// Middleware to handle database connection
app.use(async (req, res, next) => {
  try {
    req.db = await connectToDatabase();
    next();
  } catch (error) {
    console.log(error);
    //next(error);
    res.send({ status: error });
  }
});

app.get("/api/health", (req, res) => {
  res.send({ status: "ok" });
});

app.get("/api/todo", async (req, res, next) => {
  try {
    const [results] = await req.db.query("SELECT * FROM tasks");
    res.json(results);
  } catch (error) {
    next(error);
  }
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});