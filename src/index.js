const express = require("express")
const app = express()
//importing user router
const userRouter = require("./router/user")
const taskRouter = require("./router/task")
//this will directly run the mongoose.js file
require("./database/mongoose")
const port = 4000

//parses the incoming json data into objects which can used for operations
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log("app is up and listeining at port: ", + port)
})