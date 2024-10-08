const { body } = require("express-validator");

const validateUserInput = [
  body("fullName")
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 2 })
    .withMessage("Full name must be at least 2 characters long"),
  
  body("idNumber")
    .notEmpty()
    .withMessage("ID number is required")
    .isLength({ min: 13, max: 13 })
    .withMessage("ID number must be 13 digits long"),

  body("accountNumber")
    .notEmpty()
    .withMessage("Account number is required")
    .isLength({ min: 10, max: 10 })
    .withMessage("Account number must be 10 digits long"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/)
    .withMessage("Password must include one uppercase letter, one lowercase letter, one number, and one special character"),
];

module.exports = {
  validateUserInput,
};
