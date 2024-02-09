import User from "../models/user.model.js"
import bcryptjs from "bcryptjs"
import { errorHandler } from "../utils/error.js"
import jwt from "jsonwebtoken"


export const signup = async (req, res, next) =>{
    const {username, email, password} = req.body
    const hashedPassword = bcryptjs.hashSync(password, 10)
    const newUser = new User({username, email, password: hashedPassword})    
   try {
    await newUser.save()             //it will save inside the database
    res.status(201).json('User created successfully')
   } catch (error) {
//    next(errorHandler(550,'error from the function'))
    next(error)
}
}

export const signin = async (req, res, next) => {
    const {email, password} = req.body  
     try {
         const validUser = await User.findOne({email})  
         if(!validUser) return next(errorHandler(404, 'User no found'))
         const validPassword = bcryptjs.compareSync(password, validUser.password)
        if(!validPassword) return next(errorHandler(401, 'Wrong credentials'))
        const token = jwt.sign({id: validUser.id_}, process.env.JWT_SECRET)                         //for hashing we are using the second paramter
         const {password: pass, ...rest} = validUser._doc               //after api call we do not want to show the password to the user
        
        res.cookie('access token', token, {httpOnly: true})
        .status(200)
        .json(rest)
    }  catch(error) {
          next(error)
     }    
}