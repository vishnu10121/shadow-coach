const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let users = [];

app.get('/', (req, res) => {
    res.json({ message: 'Backend is running!' });
});

app.post('/api/auth/signup', (req, res) => {
    const { name, email, password } = req.body;
    const newUser = { id: Date.now(), name, email, password };
    users.push(newUser);
    res.json({ success: true, user: newUser });
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        res.json({ success: true, user });
    } else {
        res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
});

app.get('/api/auth/users', (req, res) => {
    res.json({ users });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));