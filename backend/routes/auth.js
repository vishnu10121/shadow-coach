const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Temporary storage (will replace with Supabase later)
const users = [];

// Signup - Store user with hashed password
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        console.log('📝 Signup attempt:', { name, email });
        
        // Check if user exists
        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                error: 'User already exists' 
            });
        }
        
        // Hash password - THIS IS IMPORTANT
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password: hashedPassword,  // Store HASHED password
            created_at: new Date().toISOString()
        };
        
        users.push(newUser);
        
        const token = jwt.sign(
            { id: newUser.id, email: newUser.email }, 
            process.env.JWT_SECRET || 'shadowcoach_secret_2024'
        );
        
        console.log('✅ User created:', newUser.id);
        console.log('📊 Total users:', users.length);
        
        res.json({
            success: true,
            message: 'Signup successful!',
            token,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email
            }
        });
        
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Login - REAL password verification
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log('🔐 Login attempt:', email);
        console.log('Password received:', password);
        
        // Find user
        const user = users.find(u => u.email === email);
        
        if (!user) {
            console.log('❌ User not found:', email);
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid email or password' 
            });
        }
        
        console.log('User found:', user.email);
        console.log('Stored hash:', user.password);
        
        // COMPARE password with hashed password
        const isValid = await bcrypt.compare(password, user.password);
        
        console.log('Password valid?', isValid);
        
        if (!isValid) {
            console.log('❌ Invalid password for:', email);
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid email or password' 
            });
        }
        
        const token = jwt.sign(
            { id: user.id, email: user.email }, 
            process.env.JWT_SECRET || 'shadowcoach_secret_2024'
        );
        
        console.log('✅ Login successful:', user.id);
        
        res.json({
            success: true,
            message: 'Login successful!',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all users (for testing)
router.get('/users', (req, res) => {
    const safeUsers = users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        created_at: u.created_at
    }));
    
    res.json({
        success: true,
        count: users.length,
        users: safeUsers
    });
});

// Clear all users (for testing)
router.delete('/users', (req, res) => {
    users.length = 0;
    res.json({ success: true, message: 'All users deleted' });
});

module.exports = router;