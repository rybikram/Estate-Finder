//we are creating manually error to showing to the user
export const errorHandler = (statusCode, message) =>{
    const error =  new Error()
     error.statusCode = statusCode
     error.message = message
     return error;
}