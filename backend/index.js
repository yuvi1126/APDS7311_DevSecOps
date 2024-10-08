const userRoute = require('./routes/user'); // Ensure your route path is correct
const https = require('https');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require("path")

// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware setup
app.use(express.json()); // For parsing application/json
app.use(cors({
  origin: 'http://localhost:3000',  // Adjust this to match your frontend's URL
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Allow cookies to be sent with requests
}));
app.use(helmet()); // Set security headers

// Add the user routes
app.use("/api", userRoute); 

// Serve static files from the Next.js build directory
app.use(express.static(path.join(__dirname, "./build"))); // only necessary for production

// Serve the Create-React-App site
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "../build", "index.html"));
});


// MongoDB connection setup
mongoose.connect(process.env.ATLAS_URI)
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
});

// SSL Configuration for HTTPS server
const sslOptions = {
  key: fs.readFileSync('key.pem'),  // Path to your private key file
  cert: fs.readFileSync('cert.pem') // Path to your certificate file
};

// Create an HTTPS server and listen on port 5000
https.createServer(sslOptions, app).listen(5000, () => {
  console.log('Server is running on http://localhost:5000');
}).on('error', (err) => {
  console.error('HTTPS server error:', err);
});
