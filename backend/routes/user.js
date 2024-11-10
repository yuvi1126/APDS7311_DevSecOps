const bcrypt = require("bcrypt");
const { matchedData, validationResult,  } = require("express-validator");
const mongoose = require("mongoose");
const { validateUserInput } = require('../Middleware/validators');
const User = require('../models/User');
const Employee = require('../models/Employee'); 
const router = require("express").Router();
const { check } = require("express-validator");



const validateCustomerInput = [
  check("fullName")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Full Name should only contain letters and spaces."),
  check("idNumber")
    .isNumeric()
    .isLength({ min: 13, max: 13 })
    .withMessage("ID Number should be exactly 13 digits."),
  check("accountNumber")
    .isNumeric()
    .withMessage("Account Number should only contain digits."),
  check("password")
    .isStrongPassword()
    .withMessage(
      "Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character."
    ),
];

const validateEmployeeInput = [
  check("username")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username should only contain letters, numbers, and underscores."),
  check("password")
    .isStrongPassword()
    .withMessage(
      "Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character."
    ),
];

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
    const user = await User.findOne({ idNumber });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.status(200).json({ message: "Login successful", fullName: user.fullName, userid: user.id });
  } catch (error) {
    console.error("Error during login:", error.message); // Retain for debugging
    res.status(500).json({ message: "Server error" });
  }
});



router.post('/employee-login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const employee = await Employee.findOne({ username });
    if (!employee) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, employee.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    res.status(200).json({ message: 'Login successful', username: employee.username });
  } catch (error) {
    console.error('Error in employee login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Fetch all payments for the dashboard
router.get('/payments', async (req, res) => {
  try {
    // Find all payments in the database
    const payments = await Payment.find();
    res.status(200).json(payments); // Return payments as a JSON response
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Endpoint to submit verified payments to SWIFT
router.post("/submit-swift", async (req, res) => {
  const { payments } = req.body;

  if (!payments || payments.length === 0) {
    return res.status(400).json({ message: "No payments to submit" });
  }

  try {
    // Simulate SWIFT submission (replace this with actual integration logic if needed)
    console.log("Submitting payments to SWIFT:", payments);

    // Example: Mark payments as submitted in the database (optional)
    for (const payment of payments) {
      await Payment.findByIdAndUpdate(payment._id, { status: "submitted" });
    }

    res.status(200).json({ message: "Payments submitted to SWIFT successfully" });
  } catch (error) {
    console.error("Error submitting payments to SWIFT:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create Customer Endpoint
router.post("/create-customer", validateCustomerInput, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array().map((e) => e.msg).join(", ") });
  }

  const { fullName, idNumber, accountNumber, password } = req.body;

  try {
    // Check if the customer already exists
    const existingUser = await User.findOne({ idNumber });
    if (existingUser) {
      return res.status(400).json({ message: "Customer with this ID already exists." });
    }

    // Hash the password and create the new customer
    const newCustomer = new User({
      fullName,
      idNumber,
      accountNumber,
      password, // Plain password; the model will hash it
    });

    await newCustomer.save();
    res.status(201).json({ message: "Customer created successfully!" });
  } catch (error) {
    console.error("Error creating customer:", error.message); // Retain error logs for debugging
    res.status(500).json({ message: "Server error" });
  }
});

// Create Employee Endpoint
router.post("/create-employee", validateEmployeeInput, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array().map((e) => e.msg).join(", ") });
  }

  const { username, password } = req.body;

  try {
    // Check if the employee already exists
    const existingEmployee = await Employee.findOne({ username });
    if (existingEmployee) {
      return res.status(400).json({ message: "Employee with this username already exists." });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);


    // Create the new employee
    const newEmployee = new Employee({
      username,
      password: hashedPassword,
    });

    await newEmployee.save();
    res.status(201).json({ message: "Employee created successfully!" });
  } catch (error) {
    console.error("Error creating employee:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
