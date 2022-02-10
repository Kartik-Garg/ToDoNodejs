const jwt = require("jsonwebtoken")
const User = require("../models/user")

//this middleware is used to authenticate the jwt tokens
const auth = async(req, res, next) => {
    try{
        const token = req.header('Authorization').replace('Bearer ','')
        const decoded = jwt.verify(token,'sample')
        //decoded token contains payload that is the user._id and id for timestamp
        // { _id: '6202c9b6cee1067cb657d1da', iat: 1644351126 }, that's exactly what we used to sign token
        //to authorize match the token which we got with the user.Id of the user
        //since we are accessing object in array using . that's why using ''
        const user = await User.findOne({ _id:decoded._id, 'tokens.token': token})

        if(!user){
            throw new Error('No user found')
        }
        //now in the request, we make a property with token and user and pass the value and attach it
        //to the request
        req.token = token
        req.user = user
        //to let the control know middleware operations are done
        next()

    }   catch(e){
        res.status(500)
    }

}

module.exports = auth