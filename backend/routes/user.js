const bcrypt = require("bcrypt");
const { matchedData, validationResult,  } = require("express-validator");
const mongoose = require("mongoose");
const { validateUserInput } = require('../Middleware/validators');
const User = require('../models/User');

const router = require("express").Router();

// Handles Registration of new users
router.post("/register", validateUserInput, async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        const messages = result.array().map((error) => error.msg);
        return res.status(400).json({ message: messages.join(", ") });
    }

    const { fullName, idNumber, accountNumber, password } = req.body;

    try {
        // Check for existing user by idNumber
        let existingUser = await User.findOne({ idNumber });
        if (existingUser) {
            return res.status(400).json({ message: "User with this ID number already exists" });
        }

        // Create new user without hashing the password again (User.js model will handle it)
        const newUser = new User({
            fullName,
            idNumber,
            accountNumber,
            password,  // Don't hash the password here
        });

        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Server error" });
    }
});

const Payment = require('../models/Payment'); // Import the Payment model

// Handles Payment Processing
router.post("/payment", async (req, res) => {
    const { userId, amount, currency, provider, accountInfo, swiftCode } = req.body;

    console.log("First UserID: ", userId)
  
    try {
        console.log("UserId: ", userId)
      // Ensure the userId is valid
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid userId" });
      }
      
  
      // Find the user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      console.log("User: ", user)

  
      // Create a new payment entry 
      const newPayment = new Payment({
        userId,
        amount,
        currency,
        provider,
        accountInfo,
        swiftCode,
      });
  
      const dbRes = await newPayment.save();
      console.log("Res: ", dbRes)

      res.status(201).json({ message: "Payment processed successfully", payment: newPayment });
    } catch (error) {
      console.error("Error processing payment:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  


// Handles Login of existing users
router.post("/login", async (req, res) => {
    const { idNumber, password } = req.body;

    try {
        // Find user by ID number
        const user = await User.findOne({ idNumber });
        if (!user) {
            console.log("User not found for ID number:", idNumber);
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Compare hashed password
        const isMatch = await bcrypt.compare(password, user.password);

        console.log("Password Match:", isMatch);

        if (!isMatch) {
            console.log("Invalid Password for user:", idNumber);
            return res.status(400).json({ message: "Invalid credentials" });
        }

        res.json({ message: "Logged in successfully", fullName: user.fullName, userid: user.id });
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
