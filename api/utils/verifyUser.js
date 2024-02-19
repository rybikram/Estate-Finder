import jwt from 'jsonwebtoken'
import { errorHandler } from './error.js'

export const verifyToken = (req, res, next) =>{
    // console.log("This is cookies "+ req.cookies)
    const token = req.cookies.access_token
    //  console.log("This is token" + token)
    if(!token) return next(errorHandler(401, 'Unauthorized')) 

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if(err) return next(errorHandler(403, 'Forbidden'))

        req.user = user                //here req.user id is coming from the jwt token
        next()
    })
}