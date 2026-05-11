const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Temporary in-memory storage (until Supabase is ready)
const users = [];

// Signup route
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        console.log('📝 Signup attempt:', { name, email });
        
        // Check if user already exists
        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                error: 'User already exists with this email' 
            });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create new user
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password: hashedPassword,
            created_at: new Date().toISOString()
        };
        
        users.push(newUser);
        
        // Create token
        const token = jwt.sign(
            { id: newUser.id, email: newUser.email }, 
            process.env.JWT_SECRET || 'secretkey123',
            { expiresIn: '7d' }
        );
        
        console.log('✅ User created successfully:', newUser.id);
        console.log('📊 Total users:', users.length);
        
        res.json({
            success: true,
            message: 'User registered successfully!',
            token: token,
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name
            }
        });
        
    } catch (error) {
        console.error('❌ Signup error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log('🔐 Login attempt:', email);
        
        // Find user
        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid email or password' 
            });
        }
        
        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid email or password' 
            });
        }
        
        // Create token
        const token = jwt.sign(
            { id: user.id, email: user.email }, 
            process.env.JWT_SECRET || 'secretkey123',
            { expiresIn: '7d' }
        );
        
        console.log('✅ Login successful:', user.id);
        
        res.json({
            success: true,
            message: 'Login successful!',
            token: token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        });
        
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
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

module.exports = router;