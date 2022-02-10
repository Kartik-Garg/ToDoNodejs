const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const userSchema = mongoose.Schema({
    name:{
        type:String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    age:{
        type: Number,
        default: 0,
        validate(value){
            if(value<0){
                throw new Error('Age must be a positive number')
            }
        }
    },
    password:{
        type: String,
        required: true,
        trim: true
    },
    tokens:[{
        token:{
            type:String,
            required: true
        }
    }]
})
//creating virtual type(tasks) to connect user and task schema
//populates tasks type by refering to Task where localField and ForeignField first match
userSchema.virtual('tasks', {
    ref:'Task',
    localField:'_id',
    foreignField: 'owner'
})
//generating jwt tokens
userSchema.methods.generateToken = async function() {
    const user = this
    const token = jwt.sign({_id: user._id.toString() }, 'sample')
    //basically we created an array of token objects
    user.tokens = user.tokens.concat({token})
    await user.save()

    //since returning so need of next variable
    return token
}
//hiding info from user object
//.toJSON is called when json.stringify is called which is called when res.send is called to convert
//data to json before sending it out, so in .toJSON we convert it into objects and delete certain parts
//before sending it as a response.
userSchema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()

    delete userObject.tokens
    delete userObject.password

    return userObject
}
//finding user with same credentials
userSchema.statics.findByCredentials = async (email, password) =>{
    const user = await User.findOne({email})
    if(!user){
        throw new Error ('not able to Sign-in!')
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch){
        throw new Error('Wrong password')
    }
    return user;
}
//hashing passwords using middleware in mongoose

userSchema.pre('save', async function(next) {
    const user = this

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8);
    }

    next()
})


//returns the instance of the model
const User = mongoose.model('User', userSchema)
//exporting thr User
module.exports = User
