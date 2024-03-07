import express from 'express';
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import userRouter from './routes/user.route.js'
import authRouter from './routes/auth.route.js'
import listingRouter from './routes/listing.route.js'
import cookieParser from 'cookie-parser';
import path from 'path'        //to deply the project

dotenv.config()

mongoose.connect(process.env.MONGO).then(()=>{
    console.log('Connected to mongoDB')
}).catch((err)=> {
    console.log(err)
})

const __dirname = path.resolve()  //for deply

const app = express();

app.use(express.json());

app.use(cookieParser())

app.listen(3000, ()=> {
    console.log('Server is running on port 3000!')
})

app.use('/api/user', userRouter)
app.use('/api/auth', authRouter)
app.use('/api/listing', listingRouter)

app.use(express.static(path.join(__dirname, '/client/dist')))     //for deply

app.get('*', (req, res) =>{           //for deply   //any address expect the above router will call this
res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'))
})

//middleware
app.use((err, req, res, next) =>{
    console.log(err)
  const statusCode = err.statusCode  || 500
  const message = err.message || 'Internal server error'

  return res.status(statusCode).json({
      success: false,
      statusCode,
      message
  })
})