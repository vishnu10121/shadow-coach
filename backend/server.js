const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// In-memory storage (for Render deployment)
let users = [];

// ============ AUTH ROUTES ============

// Signup
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        console.log('📝 Signup attempt:', { email, name });
        
        // Check if user exists
        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                error: 'User already exists with this email' 
            });
        }
        
        const bcrypt = require('bcryptjs');
        const jwt = require('jsonwebtoken');
        
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
            process.env.JWT_SECRET || 'shadowcoach_secret_2024',
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

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log('🔐 Login attempt:', email);
        
        const bcrypt = require('bcryptjs');
        const jwt = require('jsonwebtoken');
        
        // Find user
        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid email or password' 
            });
        }
        
        // Check password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid email or password' 
            });
        }
        
        // Create token
        const token = jwt.sign(
            { id: user.id, email: user.email }, 
            process.env.JWT_SECRET || 'shadowcoach_secret_2024',
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
app.get('/api/auth/users', (req, res) => {
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

// Delete all users (for testing)
app.delete('/api/auth/users', (req, res) => {
    users = [];
    res.json({ success: true, message: 'All users deleted' });
});

// ============ TEST ROUTES ============

app.get('/', (req, res) => {
    res.json({ 
        success: true,
        message: '🚀 ShadowCoach AI Backend Running!',
        timestamp: new Date().toISOString(),
        endpoints: [
            'POST /api/auth/signup',
            'POST /api/auth/login',
            'GET /api/auth/users'
        ]
    });
});

app.get('/api/test', (req, res) => {
    res.json({ 
        success: true, 
        message: 'API is working perfectly!' 
    });
});

// ============ START SERVER ============
app.listen(PORT, () => {
    console.log('=================================');
    console.log('✅ ShadowCoach AI Backend Running!');
    console.log(`📍 PORT: ${PORT}`);
    console.log(`📍 URL: https://shadowcoach-backend.onrender.com`);
    console.log('=================================');
    console.log('📋 Available Routes:');
    console.log('   POST   /api/auth/signup');
    console.log('   POST   /api/auth/login');
    console.log('   GET    /api/auth/users');
    console.log('=================================');
});