const mongoose = require("mongoose")
const taskSchema = mongoose.Schema({
    description:{
        type: String
    },
    completed:{
        type: Boolean
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
})

const Task = mongoose.model('Task', taskSchema)

module.exports = Task