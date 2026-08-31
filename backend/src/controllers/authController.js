const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const generateToken = require('../utils/generateToken');

async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword }
    });

    const token = generateToken(user.id);

    res.status(201).json({
      user: { id: user.id, name: user.name, email: user.email },
      token
    });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user.id);

    res.json({
      user: { id: user.id, name: user.name, email: user.email },
      token
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
}

async function getMe(req, res) {
  res.json({ user: req.user });
}

module.exports = { register, login, getMe };