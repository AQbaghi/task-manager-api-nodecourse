const express= require('express');
require('./db/mongoose.js');
const userRouter= require('./routers/user.js')
const taskRouter= require('./routers/task.js');

//creating express app and setting up the ports
const app= express();
const port= process.env.PORT;
//connecting to express routers

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

//listening to the express posrt
app.listen(port, ()=>{
    console.log('server up and running on port '+port);
});



