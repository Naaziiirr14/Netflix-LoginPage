const express = require("express");
const { body, validationResult } = require("express-validator");
const { register, login } = require("../controllers/authController");

const router = express.Router();

const validateAuth = [
  body("email").isEmail().withMessage("Please enter a valid email."),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  },
];

router.post("/register", validateAuth, register);
router.post("/login", validateAuth, login);

module.exports = router;