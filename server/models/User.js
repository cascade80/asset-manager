import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  department: { 
    type: String, 
    required: true,
    enum: ['Engineering', 'Design', 'Sales', 'HR', 'Executive', 'IT'] 
  },
  role: { 
    type: String, 
    default: 'User',
    enum: ['User', 'Admin'] 
  },
  password: {
    type: String,
    required: false,
    select: false
  },
  status: {
    type: String,
    default: 'Active',
    enum: ['Active', 'Terminated', 'On Leave']
  }
}, { 
  timestamps: true 
});

export default mongoose.model('User', userSchema);