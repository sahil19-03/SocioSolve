const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Helper: generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// ─── POST /api/auth/register ──────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const {
      name, email, password, role,
      organization, organizationType,
      university, skills, interests, bio,
      state, district, institutionType, website, registrationNo
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Name, email, password and role are required.' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      organization,
      organizationType,
      university,
      skills: skills || [],
      interests: interests || [],
      bio,
      state,
      district,
      institutionType: institutionType || null,
      website: website || null,
      registrationNo: registrationNo || null
    });

    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: user.toSafeJSON()
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration.', error: error.message });
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account has been deactivated.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: user.toSafeJSON()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.', error: error.message });
  }
});

// ─── GET /api/auth/me ─────────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

// ─── PUT /api/auth/profile ────────────────────────────────────────
router.put('/profile', protect, async (req, res) => {
  try {
    const {
      name, bio, phone, state, district,
      university, organization, organizationType, institutionType,
      website, registrationNo, avatar
    } = req.body;

    let { skills, interests } = req.body;
    if (typeof skills === 'string') {
      skills = skills.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (typeof interests === 'string') {
      interests = interests.split(',').map(s => s.trim()).filter(Boolean);
    }

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (bio !== undefined) updates.bio = bio;
    if (phone !== undefined) updates.phone = phone ? phone.trim() : null;
    if (state !== undefined) updates.state = state || null;
    if (district !== undefined) updates.district = district || null;
    if (university !== undefined) updates.university = university || null;
    if (organization !== undefined) updates.organization = organization || null;
    if (organizationType !== undefined) updates.organizationType = organizationType || null;
    if (institutionType !== undefined) updates.institutionType = institutionType || null;
    if (website !== undefined) updates.website = website || null;
    if (registrationNo !== undefined) updates.registrationNo = registrationNo || null;
    if (avatar !== undefined) updates.avatar = avatar || null;
    if (skills !== undefined) updates.skills = skills;
    if (interests !== undefined) updates.interests = interests;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await user.update(updates);

    res.json({
      success: true,
      message: 'Profile updated successfully in database.',
      user: user.toSafeJSON()
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, message: 'Server error updating profile.', error: error.message });
  }
});

// ─── PUT /api/auth/change-password ───────────────────────────────
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

module.exports = router;
