import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db/connection.js';

export async function register(req, res) {
    const { name, email, password, phone, role = 'customer' } = req.body;

    if (!name || !email || !password || !String(phone || '').trim())
        return res.status(400).json({ message: 'Name, email, password, and phone number are required' });

    if (String(phone).trim().length > 30)
        return res.status(400).json({ message: 'Phone number must be 30 characters or fewer' });

    try {
        const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);

        if (existing.length)
            return res.status(409).json({ message: 'Email is already registered' });

        const hash = await bcrypt.hash(password, 12);

        const [result] = await db.execute(
            'INSERT INTO users (name,email,password,role,phone) VALUES (?,?,?,?,?)',
            [name, email, hash, role === 'owner' ? 'owner' : 'customer', String(phone).trim()]
        );

        res.status(201).json({ id: result.insertId, message: 'Account created' });
    } catch (e) {
        res.status(500).json({ message: 'Could not create account' });
    }
}

export async function login(req, res) {
    const { email, password } = req.body;

    try {
        const [rows] = await db.execute(
            'SELECT id,name,email,password,role,phone FROM users WHERE email = ?',
            [email]
        );

        const user = rows[0];

        if (!user || !await bcrypt.compare(password, user.password))
            return res.status(401).json({ message: 'Invalid email or password' });

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || 'development_only_change_me',
            { expiresIn: '7d' }
        );

        delete user.password;

        res.json({ token, user });
    } catch {
        res.status(500).json({ message: 'Could not sign in' });
    }
}