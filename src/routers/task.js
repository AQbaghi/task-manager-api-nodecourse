const express= require('express');
const router= express.Router();
const Task= require('../models/tasks.js');
const auth= require('../middleware/auth.js');

// all about the tasks

//create tasks
router.post('/tasks', auth, async (req, res)=>{
    const task= new Task({
        ...req.body,
        owner: req.user._id
    });
    
    try{
        await task.save();
        res.status(201).send(task)
    }catch(err){
        res.status(400).send(err);
    }
});

//read tasks
router.get('/tasks', auth, async (req, res)=>{
    const match= {};
    if(req.query.completed){
        match.completed= req.query.completed==='true';
        console.log(match.completed)
    }
    let sortValue= -1;
    if(req.query.sort==='asc'){
        sortValue= 1;
    }
    console.log(req.user);
    try{
        const tasks= await Task.find({ owner: req.user._id, ...match })
            .limit(parseInt(req.query.limit))
            .skip(parseInt(req.query.skip))
            .sort( {createdAt: sortValue} );

        res.send(tasks);

        //another way of sorting things...
        // await req.user.populate({
        //     path: 'tasks',
        //     match,
        //     options: {
        //         limit: parseInt(req.query.limit),
        //         skip: parseInt(req.query.skip)
        //     }
        // }).execPopulate();
        
    }catch(err){
        res.status(500).send(err)
    }
});

//read single task
router.get('/tasks/:id', auth, async (req, res)=>{
    const _id= req.params.id;
    try{
        const task= await Task.findOne({ _id, owner: req.user._id });
        if(!task){
            return res.status(404).send({error: 'task not found'});
        }
        res.send(task);
    }catch(err){
        res.status(500).send(err);
    }
});

//update a task
router.patch('/tasks/:id', auth, async (req, res)=>{
    const _id= req.params.id;
    const change= req.body;

    //task update validation
    const allowedUpdates= ['description', 'completed'];
    const updates= Object.keys(req.body);
    const isValidOperation= updates.every(update=> allowedUpdates.includes(update));
    if(!isValidOperation){
        return res.status(400).send({"error": "you can only update a valid task entery"})
    }
    try{
        const task= await Task.findOne({ _id, owner: req.user._id});
        if(!task){
            return res.status(404).send({error: 'task not found'});
        }
        
        updates.forEach(updates=> task[updates]=change[updates] );
        
        await task.save();
        res.send(task);
    }catch(err){
        res.status(500).send(err);
    }
});

//delete task
router.delete('/tasks/:id', auth, async (req, res)=>{
    const _id= req.params.id;
    try{
        const task= await Task.findOneAndDelete({ _id, owner: req.user._id });
        if(!task){
            return res.status(404).send();
        }
        res.send(task);
    }catch(err){
        res.status(500).send(err);
    }
});

module.exports= router;