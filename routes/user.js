const express = require('express')
const { validationResult, check } = require('express-validator');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const router = express.Router();

const User = require('../models/User');
const auth = require('../middlewares/auth')
const secret = require('../config/keys').loginSecret


const obj = user => {
   return {
       id: user.id,
       name: user.name,
       username: user.username,
       email: user.email,
       createdAt: user.createdAt
   }
};
/**
 *  @method - POST
 *  @param - /signup
 *  @description - Professor sign up
 */


router.post("/signup",
    [
        check('username').not().isEmpty(),
        check('name').notEmpty(),
        check('email', 'Please enter a valid email address').isEmail(),
        check('password').not().isEmpty()
    ],
    async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(422).json({
            errors: errors.array()
        })
    }
    const {username, name, email, password} = req.body;
    try {


        let user = await User.findOne({email});
        if (user) {
            return res.status(422).json({message: 'User already exists.'})
        }
        user = new User({
            username, name, email, password
        });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        const payload = {
            user: {
                id: user.id
            }
        };
        jwt.sign(payload, secret, {
            expiresIn: 100000
        }, (err, token) => {
            if (err) throw err;
            delete  user.password;
            res.status(200).json(
                {message: "Account created successfully",
                token,
                user: obj(user)
            })
        })
    }catch (error) {
        console.log(error.message)
        res.status(500).send('Error in saving');
    }
});


/**
 *  @method - POST
 *  @param - /login
 *  @description - Professor login
 */

router.post('/login',
    [
        check('username', 'You cannot login with an empty username.').not().isEmpty()
    ],
    async (req, res)=> {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(422).json({
            errors: errors.array()
        })
    }
    const { username, password} = req.body;
    try{
        let user = await User.findOne({username});
        if(!user){
            return res.status(400).json({message: 'No account found.'})
        }

        const isPassword = await bcrypt.compare(password, user.password);
        if (!isPassword){
            return  res.status(400).json({
                message: "username/password not correct"
            })
        }
        const payload = {
            user: {
                id: user.id
            }
        }
        jwt.sign(payload, secret,{expiresIn: 10000}, (err, token) => {
            if (err) throw err;
            res.status(200).json({
                message: "Login Successfully",
                token, user: obj(user)
            })
        })
    }catch (e) {
        console.log(e)
        res.status(500).json({
            message: "Internal Server error"
        })
    }
});

/**
 *  @method - GET
 *  @param - /me
 *  @description - Professor profile
 */
router.get('/me',auth, async (req, res)=> {
    try{
        const user = await User.findById(req.user.id);
        res.status(200).json({
            message: "Professor profile",
            user: obj(user)
        });
    } catch (e) {
        res.send('Error fetching user')
    }
});

router.get('/logout', auth, async (req, res) => {
    const token = req.header("token");
    try{
        const decoded = jwt.verify(token, secret, (error, decoded) => {
            decoded.exp - parseInt(new Date().getTime()/1000)
        });
        res.status(200).json({
            message: 'Logout successfully'
        })
    }catch (e) {
        console.log('Auth middleware error', e)
        res.status(500).send({message: 'Invalid token', error: e.message})
    }
});

module.exports = router;