const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Define Employee schema
const employeeSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Create Employee model
const Employee = mongoose.model("Employee", employeeSchema);

// Connect to MongoDB
const dbURI = "mongodb+srv://yuvipather:Cricket101@cluster0.p6mfezx.mongodb.net/test?retryWrites=true&w=majority";

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("Connected to MongoDB");

    // Clear existing employees
    await Employee.deleteMany({});

    // Seed employees with the same password
    const employees = [
      { username: "admin1", password: "Password123!" },
      { username: "admin2", password: "Password123!" },
      { username: "manager1", password: "Password123!" },
      { username: "manager2", password: "Password123!" },
      { username: "finance1", password: "Password123!" },
      { username: "finance2", password: "Password123!" },
      { username: "hr1", password: "Password123!" },
      { username: "hr2", password: "Password123!" },
      { username: "it1", password: "Password123!" },
      { username: "it2", password: "Password123!" },
      { username: "developer1", password: "Password123!" },
      { username: "developer2", password: "Password123!" },
    ];

    // Hash passwords and save employees
    for (const employee of employees) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(employee.password, salt);

      const newEmployee = new Employee({
        username: employee.username,
        password: hashedPassword,
      });

      await newEmployee.save();
      console.log(`Employee ${employee.username} added`);
    }

    mongoose.disconnect();
    console.log("Seeding completed and disconnected from MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  });
