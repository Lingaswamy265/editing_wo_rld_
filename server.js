// server.js - minimal demo server
const express = require('express');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// Serve static frontend files
app.use(express.static(path.join(__dirname,'public')));

// Session config (demo). In production:
// - set secure: true (HTTPS)
// - use a persistent session store (Redis, DB)
app.use(session({
  secret: 'replace-with-a-strong-secret', 
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000*60*60*24 } // 1 day
}));

// Simple in-memory user store for demo only
const users = {}; // { username: { passwordHash } }

app.post('/api/signup', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({message:'Missing fields'});
  if (users[username]) return res.status(409).json({message:'User exists'});
  const hash = await bcrypt.hash(password, 10);
  users[username] = { passwordHash: hash };
  req.session.user = { username };
  res.json({message:'Account created', username});
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const u = users[username];
  if (!u) return res.status(401).json({message:'Invalid credentials'});
  const ok = await bcrypt.compare(password, u.passwordHash);
  if (!ok) return res.status(401).json({message:'Invalid credentials'});
  req.session.user = { username };
  res.json({message:'Logged in', username});
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({message:'Logged out'});
  });
});

app.get('/api/me', (req, res) => {
  if (req.session.user) res.json(req.session.user);
  else res.status(401).json({message:'Not logged in'});
});

// Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`Server running on http://localhost:${PORT}`));
