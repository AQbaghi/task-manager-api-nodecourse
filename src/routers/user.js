const express= require('express');
const multer= require('multer');
const sharp= require('sharp');
const router= express.Router();
const User= require('../models/users.js');
const Task= require('../models/tasks');
const auth= require('../middleware/auth.js');
const { sendWelcomingSMS, sendFarewaleSMS }= require('../phone-numbers/numbers.js');

//all about the users

// creat users
router.post('/users', async (req, res)=>{
    const user= new User(req.body);
    try{
        await user.save();
        sendWelcomingSMS(user.number, user.name);
        const token= await user.genarateAuthToken();
        res.status(201).send({user, token});
    }catch(err){
        res.status(400).send(err);
    }
});

//login users
router.post('/users/login', async (req, res)=>{
    try{
        const user= await User.findByCredentials(req.body.email, req.body.password);
        const token= await user.genarateAuthToken();
        res.send({user, token});
    }catch(err){
        res.status(400).send(err);
    }
});

//logout user
router.post('/users/logout', auth, async (req, res)=>{
    try{
        req.user.tokens= req.user.tokens.filter(token=>{
            if(token.token!==req.token){
                return token;
            }
        });
        await req.user.save();
        res.send();
    }catch(err){
        res.status(500).send();
    }
});

//logout all users
router.post('/users/logoutall', auth, async (req, res)=>{
    try{
        req.user.tokens= [];
        await req.user.save();
        res.send();
    }catch(err){
        res.status(500).send();
    }
});

//read users
router.get('/users/me', auth, async (req, res)=>{
    try{
        res.send(req.user);
    }catch(err){
        res.status(500).send(err);
    }
});

//update users
router.patch('/users/me', auth, async (req, res)=>{
    const change= req.body;
    
    // validation to updates
    const allowedUpdates= ['name', 'age', 'email', 'password'];
    const updates= Object.keys(req.body);
    const isValidOperation= updates.every(update=> allowedUpdates.includes(update));
    if(!isValidOperation){
        return res.status(400).send({ "error": "you can only update a valid user entery"});
    }
    try{
        updates.forEach(update=> req.user[update]= change[update] );
        await req.user.save();
        res.send(req.user);   
    }catch(err){
        res.status(500).send(err);
    }
});

//delete user
router.delete('/users/me', auth, async (req, res)=>{
    try{
        await Task.deleteMany({ owner: req.user._id });
        sendFarewaleSMS(req.user.number, req.user.name);
        await req.user.remove();
        res.send(req.user);
    }catch(err){
        res.status(500).send(err);
    }
});

//avatar profile picture upload
const avatar= multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|png|jpeg)$/)){
            return cb(new Error('file must be an image'));
        }
        cb(undefined, true);
    }
});
router.post('/users/me/avatar', auth, avatar.single('avatar'), async (req, res)=>{
    const buffer= await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
    req.user.avatar= buffer;
    await req.user.save();
    res.status(201).send({success: 'avatar picture was successfully uploaded'});
}, (err, req, res, next)=>{
    res.status(400).send({error: err.message });
});

//avatar profile picture delete
router.delete('/users/me/avatar', auth, async (req, res)=>{
    try{
        if(!req.user.avatar){
            res.status(400).send({error: 'can not delete non existing avatar picture'})
        }
        req.user.avatar= undefined;
        await req.user.save();
        res.send({success: 'avatar picture was successfully deleted'});
   }catch(err){
        res.status(500).send({error: 'can not delete avatar profile picture'});
   }
});

//serving up an image
router.get('/users/:id/avatar', async (req, res)=>{
    try{
        const user= await User.findById(req.params.id);
        if(!user||!user.avatar){
            throw new Error('can not get picture');
        }
        res.set('Content-Type', 'image/jpg');
        res.send(user.avatar);
    }catch(err){
        res.send({error: err.message });
    }
});

module.exports= router;