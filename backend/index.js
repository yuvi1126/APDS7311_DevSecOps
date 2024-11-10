const userRoute = require('./routes/user'); 
const https = require('https');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require("path")

dotenv.config();

const app = express();

// Middleware setup
app.use(express.json()); // For parsing application/json
app.use(cors({
  origin: 'https://localhost:3000', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Explicitly list allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Explicitly list allowed headers
  credentials: true // Allow credentials (cookies, etc.)
}));

app.use(helmet()); // Set security headers

// Add the user routes
app.use("/api", userRoute); 

// Serve static files from the Next.js build directory
app.use(express.static(path.join(__dirname, "../frontend/build"))); 

// Serve the Create-React-App site
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
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
  key: fs.readFileSync('key.pem'),  
  cert: fs.readFileSync('cert.pem') 
};

app.use((req, res, next) => {
  if (!req.secure) {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});



// Create an HTTPS server and listen on port 5000
https.createServer(sslOptions, app).listen(5000, () => {
  console.log('Server is running on https://localhost:5000');
}).on('error', (err) => {
  console.error('HTTPS server error:', err);
});
