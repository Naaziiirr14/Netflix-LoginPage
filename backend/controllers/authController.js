const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const users = [];

const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = users.find((u) => u.email === email);
    if (existingUser) {
      return res.status(409).json({ message: "User already exists with this email." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = { id: Date.now(), email, password: hashedPassword };
    users.push(newUser);

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User registered successfully.",
      token,
      user: { id: newUser.id, email: newUser.email },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error during registration." });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = users.find((u) => u.email === email);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful.",
      token,
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error during login." });
  }
};

module.exports = { register, login };