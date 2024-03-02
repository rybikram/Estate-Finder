import bcryptjs from "bcryptjs"
import { errorHandler } from "../utils/error.js"
import User from "../models/user.model.js"
import Listing from "../models/listing.model.js"

export const test = (req,res) =>{
    res.json({
        message: 'Hello world'
    })
}

export const updateUser = async (req, res, next) => {
    console.log('User id is ' + req.user.id)
    console.log('Params id is ' + req.params.id)
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

        const {password, ...rest} = updatedUser._doc
        res.status(200).json(rest)
     } catch (error) {
        next(error)
     }
} 


export const deleteUser = async (req, res, next) => {
    if(req.user.id != req.params.id) return next(errorHandler(401, 'You can only delete your own account'))
        
    try {
        await User.findByIdAndDelete(req.params.id)
        res.clearCookie('access_token')                   //user will be delete as well as cookie will be destroy and will be redirect to the sign-in page
        res.status(200).json('User has been deleted')
    } catch (error) {
        
    }

}


export const getUserListings = async (req, res, next) => {
    if(req.user.id === req.params.id){
        // console.log('user id is: ' + req.user.id)
        // console.log('Params id is: ' + req.params.id)
        try {
            const listings = await Listing.find({userRef: req.params.id})     //here the params id is from create listing id
            res.status(200)
            .json(listings)
        } catch (error) {
            
        }
    }else{
        return next(errorHandler(401, 'You can only view you own listings!'))
    }
}


export const getUser = async (req, res, next) => {
    try {      
        const user = await User.findById(req.params.id)
    
        if(!user) return next(errorHandler(404, 'User not found!'))
    
        const {password: pass, ...rest} = user._doc
    
        res.status(200).json(rest)
    } catch (error) {
        next(error)
    }
}