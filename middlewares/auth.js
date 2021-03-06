const jwt = require('jsonwebtoken')
const secret = require('../config/keys').loginSecret
module.exports = (req, res, next) => {
    const token = req.header("token");
    if (!token) return res.status(401).json({message: 'Unauthenticated'});
    try{
        const decoded = jwt.verify(token, secret);
        req.user = decoded.user;
        next();
    }catch (e) {
        console.log('Auth middleware error', e)
        res.status(500).send({message: 'Invalid token or token expired'})
    }
}