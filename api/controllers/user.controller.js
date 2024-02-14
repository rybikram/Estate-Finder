import bcryptjs from "bcryptjs"
import { errorHandler } from "../utils/error.js"
import User from "../models/user.model.js"

export const test = (req,res) =>{
    res.json({
        message: 'Hello world'
    })
}

export const updateUser = async (req, res, next) => {
    if(req.user.id != req.params.id) return next(errorHandler(401, "You can only update your own account"))

     try {
        //if user want to change the password then
        if(req.body.password){
            req.body.password = bcryptjs.hashSync(req.body.password, 10)
        }

        const updatedUser = await User.findByIdAndUpdate(req.params.id, {
            $set : {                               //if user want to change only the username nothing else like that 
                 //here what the user can update here
                 username : req.body.username,
                 email : req.body.email,
                 password : req.body.password,
                 avatar : req.body.avatar
            }
        }, {new: true})  //here new will update the information as per the latest value
           
        const {password: pass, ...rest} = updatedUser._doc
        res.json(200).json(rest)
     } catch (error) {
        next(error)
     }
} 