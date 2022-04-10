const express = require("express")
const router = express.Router()
const Task = require("../models/task")
const auth = require("../middleware/auth")

//creating new tasks
router.post('/tasks', auth, async(req, res) => {
    //the req.body will have just description and completed status, but we need to add owner too
    //to relate to the user, so we use object for creating object of model Task
    const task = new Task({
        ...req.body,
        owner:req.user._id,
    })

    try{
        await task.save()
        res.status(201).send(task)
    } catch(e) {
        res.status(500).send({error:'not able to create task for particular user'})
    }
})

//seeing tasks of current user
router.get('/tasks', auth, async(req,res) => {
    //have to populate virtual proepery task for the given user
    try{
        //const tasks = await Task.find({ owner:req.user._id})
        // await req.user.populate('tasks').execPopulate()
        // //res.status(200).send(req.user.tasks)
        // res.send(tasks)
         await req.user.populate('tasks')
         res.send(req.user.tasks)
        //console.log(req.user.tasks)
       // await req.user.populate('tasks').execPopulate()  
       //     res.send(req.user.tasks)
            
    } catch (e) {
        res.status(500).send('not able to populate virtual')
    }
})
//modifying an existing task
router.patch('/tasks/:id' , auth, async(req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    if(!isValidOperation){
        return res.status(500).send({error:'Request body is wrong'})
    }
    try{
        //fetching the task with the help of id and owner
        const task = await Task.findOne({_id:req.params.id, owner:req.user._id})
        if(!task)
        {
            return res.status(404).send('Task not found')
        }

        //dynamically update task properties.
        updates.forEach((update) => {
            task[update] = req.body[update]
        })
        //saving the task
        await task.save()
        res.status(200).send(task)

    } catch(e) {
        console.log(e)
        res.send(e)
    }
})

router.delete('/tasks/:id', auth, async(req, res) => {
    try{
        const task = await Task.findOneAndDelete({_id:req.params.id, owner:req.user._id})
       // console.log(task)
        if(!task){
            res.status(404).send('Task not found')
        }
        res.send(task)
    } catch(e){
        res.status(500).send()
    }
})
//getting public tasks
router.get('/tasks/:id', async(req,res)=>{
    const task = await Task.findOne({_id:req.params.id})
    if(!task){
        res.status(404).send('task does not exist')
    }
    if(task.visibility === "public"){
        res.send(task)
    }
    else{
        res.send({error:'private task'})
    }
})
router.get('/tasksprivate/:id', async(req,res)=>{
    const task = await Task.findOne({_id:req.params.id})
    if(!task){
        res.send({error:'Task does not exist'})
    }
    if(task.visibility === "private"){
        res.send(task)
    }
    else{
        res.send('some error')
    }
})
module.exports = router