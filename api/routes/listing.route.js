import express from "express";
import { createListing, deleteListing, updateListing, getListing, getListings } from "../controllers/listing.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router()


router.post('/create', verifyToken, createListing)
router.delete('/delete/:id', verifyToken, deleteListing)  //here this is the the delete of perticular listing from the listings
router.post('/update/:id', verifyToken, updateListing)
router.get('/get/:id', getListing)            //to get information of perticular listing details
router.get('/get', getListings)                      //For search functionality

export default router