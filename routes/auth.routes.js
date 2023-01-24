const Router = require("express");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const config = require("config");
const {check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const router = new Router();
const authMiddleWare = require("../middleware/auth.middleware");

router.post('/registration',[
    check('email','incorrect email').isEmail(),
    check('password','Password has to be at least one character').isLength({min: 1, max: 50})

]
 ,async (req, res) =>{
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({message: 'Incorrect Email or Password!', errors})
        }
        const {email, password, name} = req.body;
        const candidate = await User.findOne({email})
        if (candidate){
            return res.status(400).json({message:`User ${email} already exists`})
        }
        const hashPas = await bcrypt.hash(password,2);
        const user = new User({email, password: hashPas, name,block:"Unblocked"});
        await user.save();
        return res.json({message:'User is created'});

    } catch(e){
        console.log(e);
        res.send({ message: 'Server Error' })
    }
})

router.post('/login',async (req, res) =>{
    try {
        const {email, password, name} = req.body;
        const user = await User.findOne({email});
        console.log("!");
       console.log(user);
        if(!user){
            return res.status(404).json({message:`User not found`})
        }
        if(user.block == 'Blocked'){
            return res.status(400).json({message:`User is blocked`})
        }
        const isPassValid = bcrypt.compareSync(password, user.password)
        if(!isPassValid){
            return res.status(400).json({message:`Invalid password`})
        }
        const token = jwt.sign({id:user.id},config.get("secretKey"),{expiresIn:'5h'})
        return res.json({
            token,
            user: {
                id:user.id,
                email:user.email,
                name: user.name
            }
        })

    } catch(e){
        console.log(e);
        res.send({ message: 'Server Error' })
    }
})

router.get('/auth',authMiddleWare, async (req, res) =>{
    try {
       const user = await User.findOne({_id:req.user.id});
       if(user.block == 'Blocked'){
        return res.status(400).json({message:`User is blocked`})
    }
       const token = jwt.sign({id:user.id},config.get("secretKey"),{expiresIn:'5h'})
        return res.json({
            token,
            user: {
                id:user.id,
                email:user.email,
                name: user.name
            }
        })

    } catch(e){
        console.log(e);
        res.send({ message: 'Server Error' })
    }
})
router.get('/users', async (req, res) =>{
    try {
       const user = await User.find();
        return res.json({
            user
        })

    } catch(e){
        console.log(e);
        res.send({ message: 'Server Error' })
    }
})
router.post('/delete', async (req, res) =>{
    try {
        const {checked} = req.body;
      const result = await User.deleteMany({_id:{$in:checked}});
      return res.json({
        result
    })
       

    } catch(e){
        console.log(e);
        res.send({ message: 'Server Error' })
    }
})
router.post('/block', async (req, res) =>{
    try {
        const {checked} = req.body;
      const result = await User.updateMany({_id:{$in:checked}},{$set:{block:"Blocked"}});
      return res.json({
        result
    })
       

    } catch(e){
        console.log(e);
        res.send({ message: 'Server Error' })
    }
})
router.post('/unblock', async (req, res) =>{
    try {
        const {checked} = req.body;
      const result = await User.updateMany({_id:{$in:checked}},{$set:{block:"Unblocked"}});
      return res.json({
        result
    })
       

    } catch(e){
        console.log(e);
        res.send({ message: 'Server Error' })
    }
})

module.exports = router;