import express from 'express';
import User from '../models/User.js';

const router = express.Router();


router.get('/', async (req, res) => {
  try {
    const users = await User.find().sort({ name: 1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.post('/', async (req, res) => {
  try {
    const newUser = new User(req.body);
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


router.post('/bulk', async (req, res) => {
  try {
    const usersArray = req.body; 
    
    
    const insertedUsers = await User.insertMany(usersArray);
    
    res.status(201).json({ message: `Successfully imported ${insertedUsers.length} users!` });
  } catch (error) {
    console.error("Bulk import error:", error);
    res.status(500).json({ message: "Failed to import users.", error });
  }
});

export default router;