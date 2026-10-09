import jwt from 'jsonwebtoken';

export function authenticate(req, res, next) {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');

    if (!token)
        return res.status(401).json({ message: 'Authentication required' });

    try {
        req.user = jwt.verify(
            token,
            process.env.JWT_SECRET || 'development_only_change_me'
        );

        next();
    } catch {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}

export function ownerOnly(req, res, next) {
    if (req.user?.role !== 'owner')
        return res.status(403).json({ message: 'Hotel owner access required' });

    next();
}