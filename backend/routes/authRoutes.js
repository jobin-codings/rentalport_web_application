const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dataStore = require('../services/dataStore');
const User = require('../models/User');
const { getMongoStatus } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'drivenow_jwt_super_secret_key_2026';

// Register User (Customer or Partner)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, city, license } = req.body;

    if (!name || !email || !password || !city || (role === 'customer' && !license)) {
      return res.status(400).json({ error: 'Fill in every field to create your account.' });
    }

    const lowerEmail = email.toLowerCase().trim();

    if (getMongoStatus()) {
      const existing = await User.findOne({ email: lowerEmail });
      if (existing) {
        return res.status(400).json({ error: 'An account with that email already exists. Try signing in.' });
      }

      const hashedPassword = await bcrypt.hash(password, 8);
      const newUser = await User.create({
        name,
        email: lowerEmail,
        password: hashedPassword,
        role: role || 'customer',
        city,
        license: license || null
      });

      const token = jwt.sign({ id: newUser._id, role: newUser.role, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({
        message: 'Registration successful',
        token,
        user: { _id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role, city: newUser.city }
      });
    } else {
      const existing = dataStore.findUserByEmail(lowerEmail);
      if (existing) {
        return res.status(400).json({ error: 'An account with that email already exists. Try signing in.' });
      }

      const hashedPassword = bcrypt.hashSync(password, 8);
      const newUser = {
        _id: `usr_${Date.now()}`,
        name,
        email: lowerEmail,
        password: hashedPassword,
        role: role || 'customer',
        city,
        license: license || null
      };

      dataStore.addUser(newUser);

      const token = jwt.sign({ id: newUser._id, role: newUser.role, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({
        message: 'Registration successful',
        token,
        user: { _id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role, city: newUser.city }
      });
    }
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Enter both your email and password." });
    }

    const lowerEmail = email.toLowerCase().trim();
    let user = null;

    if (getMongoStatus()) {
      user = await User.findOne({ email: lowerEmail });
    } else {
      user = dataStore.findUserByEmail(lowerEmail);
    }

    if (!user) {
      return res.status(401).json({ error: "Email and password don't match any account." });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Email and password don't match any account." });
    }

    const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        city: user.city,
        license: user.license
      }
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

module.exports = router;
