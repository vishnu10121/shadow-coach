const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middleware - YAHAN SAHI SE DAALO
app.use(cors());
app.use(express.json());

// ✅ Simple test route FIRST
app.get('/', (req, res) => {
    res.json({ 
        success: true,
        message: 'ShadowCoach AI Backend Running!',
        timestamp: new Date().toISOString()
    });
});

// ✅ Auth routes - Pehle ensure karo file exist karti hai
let authRoutes;
try {
    authRoutes = require('./routes/auth');
    app.use('/api/auth', authRoutes);
    console.log('✅ Auth routes loaded');
} catch (err) {
    console.log('⚠️ Auth routes not found, using fallback');
    app.use('/api/auth', (req, res) => {
        res.json({ message: 'Auth routes will be added soon' });
    });
}

// ✅ Test route
app.get('/api/test', (req, res) => {
    res.json({ 
        success: true, 
        message: 'API is working perfectly!' 
    });
});

// ✅ Start server
app.listen(PORT, () => {
    console.log('=================================');
    console.log('✅ ShadowCoach AI Backend Running!');
    console.log(`📍 http://localhost:${PORT}`);
    console.log('=================================');
});