import Listing from "../models/listing.model.js"
import { errorHandler } from "../utils/error.js"
//Romio
import {isValidObjectId} from "mongoose"

export const createListing = async (req, res, next) => {
 try {
    const listing = await Listing.create(req.body)
    return res.status(201).json(listing)
 } catch (error) {
    next(error)
 }   
}



export const deleteListing = async (req, res, next) =>{

   if(!isValidObjectId(req.params.id)){
      return next(errorHandler(404, 'Invalid listing id'))
   }

   const listing = await Listing.findById(req.params.id)   //checking the listing is exiist or not

   if(!listing) {
      return next(errorHandler(404, 'Listing not found!'))
   }


   if(req.user.id !== listing.userRef) {
      return next(errorHandler(401, 'You can only delete your own listings!'))
   }

   try {
      await Listing.findByIdAndDelete(req.params.id)
      res.status(200).json('Listing has been deleted')
   } catch (error) {
      next(error)
   }
}



export const updateListing = async (req, res, next) => {


   if(!isValidObjectId(req.params.id)){
      return next(errorHandler(404, 'Invalid listing id'))
   }

   const listing = await Listing.findById(req.params.id)

   //Romio
   //const listing = await Listing.findOne({_id: req.params.id})
   //The above code does not require valid object id check

   if(!listing) {
      return next(errorHandler(404, 'Listing not found'))
      //Romio
      //return res.status(404).json({err: 'Listing not found'})
   }
   
   if(req.user.id !== listing.userRef) {
      // return res.status(401).json({err: 'You can only update your own listings!'})
      return next(errorHandler(401, 'You can only update your own listings!'))
   }

   try {
       const updatedListing = await Listing.findByIdAndUpdate(
         req.params.id,
         req.body,
         {new: true}
       )

       res.status(200).json(updatedListing)
   } catch (error) {
      next(error)
   }
}