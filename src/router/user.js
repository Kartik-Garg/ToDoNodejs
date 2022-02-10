const express = require("express")
const router = express.Router()
const User = require("../models/user")
const jwt = require("jsonwebtoken")
const auth = require("../middleware/auth")

//user sign up
router.post('/users', async (req, res) => {
    const user = User(req.body)
    const token = await user.generateToken()
    try{
    await user.save()    
    res.status(201).send({token, user})
    } catch(e){
        res.status(400).send(e)
    }
})

router.post('/users/login' , async(req, res) => {
    try{
        //since we are using method directly on the Model so it will statics
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateToken()
        res.status(200).send({user,token})
    } catch (e) {
        res.status(500).send({error:'nahi ho rha log in bhai'})
    }
})

//here we pass token in auth which is in middleware part which verifies jwt token which we get either by logging
//in or by sign up
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

//for logging out
router.post('/users/logout' , auth, async(req,res) => {
    //for logging out, we have to remove the token which was used to log in
    //so we remove it from the tokens array for that particular user
    //req.user object we get from middleware and we modify the tokens array here
    try{
    req.user.tokens = req.user.tokens.filter((token)=>{
        //filter method returns the argument which matches the condition
        //for each token object in the array, return tokens which are not 
        //equal to the passed token, hence filtering out the array
        //didnt get why token.token- got it
        //first token can be any name- just represents the element in the array
        //second token is the propery of the object. hence, token.token
        return token.token !== req.token 
        })
        //save back the new list
        await req.user.save()
        res.send('Successfully logged out')
    }
    catch(e) {
        res.status(500).send("can't log out")
    }
})
//hiding info - .toJSON in model classes

module.exports = router
