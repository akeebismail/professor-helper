const express = require('express')
const bodyParser = require('body-parser')
const user = require('./routes/user')
const InitDB = require('./config/db')

//connect db
InitDB();

const app = express();

const PORT = process.env.PORT || 4000;

//App middleware
app.use(bodyParser.json());
app.get('/', (req, res)=> {
    res.json({message: "API working"})
})

/**
 * Router Middleware
 *  Router - professor authentication
 */
app.use('/auth', user);

app.listen(PORT, (req, res)=> {
    console.log(`Server started on port ${PORT}`)
})