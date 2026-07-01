import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();


router.get('/setup', async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const existingAdmin = await User.findOne({ email: 'admin@xyz.com' }).select('+password');

    if (existingAdmin) {
      existingAdmin.name = 'System Admin';
      existingAdmin.department = 'IT';
      existingAdmin.role = 'Admin';
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();

      return res.json({ message: 'Admin credentials refreshed! Email: admin@xyz.com | Password: password123' });
    }

    const adminUser = new User({
      name: 'System Admin',
      email: 'admin@xyz.com',
      department: 'IT',
      role: 'Admin',
      password: hashedPassword
    });

    await adminUser.save();
    res.json({ message: 'First admin created! Email: admin@xyz.com | Password: password123' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    
    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'super_secret_fallback_key',
      { expiresIn: '8h' }
    );

    res.json({ token, user: { name: user.name, role: user.role, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login' });
  }
});

export default router;