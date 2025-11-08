const express = require('express')
const app = express()
const port = process.env.PORT || 3000;
const cors = require('cors')
// middleware
app.use(cors())
app.use(express.json())


app.get('/',(req,res)=>{
    res.send('Hello World! from Express Server assignment')
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})