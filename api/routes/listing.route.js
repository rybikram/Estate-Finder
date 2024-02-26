import express from "express";
import { createListing, deleteListing, updateListing } from "../controllers/listing.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router()


router.post('/create', verifyToken, createListing)
router.delete('/delete/:id', verifyToken, deleteListing)  //here this is the the delete of perticular listing from the listings
router.put('/update/:id', verifyToken, updateListing)

export default router