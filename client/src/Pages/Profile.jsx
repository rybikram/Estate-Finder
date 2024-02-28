import { useDispatch, useSelector } from "react-redux"
import { useEffect, useRef, useState } from "react"
import {getDownloadURL, getStorage, ref, uploadBytesResumable} from 'firebase/storage'
import { app } from "../firebase"
import { deleteUserFailure, deleteUserStart, deleteUserSuccess, signOutUserStart, updateUserFailure, updateUserStart, updateUserSuccess } from "../redux/user/userSlice"
import {Link} from 'react-router-dom'

export default function Profile() {

const {currentUser, loading, error} = useSelector((state) => state.user)
const fileRef = useRef(null)
const [file, setFile] = useState(undefined)
const [filePrec, setFilePerc] = useState(0)
const [fileUploadError, setFileUploadError] = useState(false)
const [formData, setFormData] = useState({})         //empty object
const [updateSuccess, setUpdateSuccess] = useState(false)
const dispatch = useDispatch()
const [showListingsError, setShowListingsError] = useState(false)
const [userListings, setUserListings] = useState([])
const [oneListingError, setOneListingError] = useState(false)
// console.log(filePrec) 
// // console.log(file)
// console.log(formData)
// console.log(fileUploadError)


useEffect(()=>{
   if(file){
     handleFileUpload(file)
   }
}, [file])


const handleFileUpload = () =>{
    const storage = getStorage(app)      //here app is coming form firebase created app
    const fileName = new Date().getTime() + file.name          //This is for giving unik name of firebase
    const storageRef = ref(storage, fileName)    
    const uploadTask = uploadBytesResumable(storageRef, file)             //This is for to see the progress in percentage while uploading
    
    uploadTask.on('state_changed', 
       (snapshot) =>{                   //snapshot is piece of information of each state change
          const progress = (snapshot.bytesTransferred /                  //here these all are ragading to the bytes
           snapshot.totalBytes) * 100
          //  console.log('Upload is' + progress + '% done')
          setFilePerc(Math.round(progress))                             //This is for rounded progress percentage
       },
       
       (error) =>{
          setFileUploadError(true)
       },

       () => {
        // To get the download url
        getDownloadURL(uploadTask.snapshot.ref).then
        ((downloadURL) =>{
           setFormData({
            ...formData, avatar: downloadURL
           })
        })
       }

    )
}
 


const handleChange = (e) => {
   setFormData({...formData, [e.target.id]: e.target.value})
}

const handleSubmit = async (e) => {
   // console.log(currentUser._id)
   e.preventDefault()
   try {
      dispatch(updateUserStart())
      const res = await fetch(`/api/user/update/${currentUser._id}`,
         {
            method: 'POST',
            headers: {
               'Content-Type' : 'application/json',
            },
          body: JSON.stringify(formData)
         })
         const data = await res.json()
         // console.log(data)
         if(data.success === false){
            dispatch(updateUserFailure(data.message))
            return
         }
         dispatch(updateUserSuccess(data))
         setUpdateSuccess(true)

   } catch (error) {
      // console.log(error)
      dispatch(updateUserFailure(error.message))

   }
}

 
//For delete

const handleDeleteUser = async () => {
   try {
      dispatch(deleteUserStart())
     const res = await fetch(`/api/user/delete/${currentUser._id}`,{
      method: 'DELETE'
     })
   //   console.log(data)
     const data = await res.json()
// console.log(data)
     if(data.success == false){
      dispatch(deleteUserFailure(data.message))
      return
     }
     dispatch(deleteUserSuccess(data))

   } catch (error) {
      dispatch(deleteUserFailure(error.message))
   }
}


//For sign out

const handleSignOut = async () =>{
      try {
            dispatch(signOutUserStart())
         const res = await fetch('/api/auth/signout')   //by default will take GET method
         const data = await res.json()
   
         if(data.success === false){
           dispatch(deleteUserFailure(data.message))
           return
         }
         dispatch(deleteUserSuccess(data)) 

      } catch (error) {
         dispatch(deleteUserSuccess(error.message))
      }
}


//For showing all the listings

const handleShowListings = async () =>{
    try {
      setShowListingsError(false)                 //it will clean the previous error
      const res = await fetch(`/api/user/listings/${currentUser._id}`)

      const data = await res.json()
      if(data.success === false){
         setShowListingsError(true)
         return
      }
      setUserListings(data)
      setShowListingsError(false)
    } catch (error) {
       setShowListingsError(true)
    }
}



// For delete a specific listing

const handleListingDelete = async (listingId) =>{
   try {
      setOneListingError(false)
      const res = await fetch(`/api/listing/delete/${listingId}`,{
         method: 'DELETE'
        })
     const data = await res.json()   
        if(data.success === false){
         setOneListingError(true)
         return
        }
        setUserListings((prev) => prev.filter((listing) => listing._id != listingId))
        setOneListingError(false)
   } catch (error) {
       setOneListingError(true)
   }
}




return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className='text-3xl font-semibold text-center 
      my-7 '>Profile</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            <input 
            onChange={(e)=> setFile(e.target.files[0])}       //here we are taking th first value
            type="file" 
            ref={fileRef} 
            hidden accept="image/*" />            {/* This is accept only image file */}
          
            <img onClick={()=> fileRef.current.click()} 
            src={formData.avatar || currentUser.avatar} alt="profile"        //here afrer uploading the image updated image will come
            className="rounded-full h-24 w-24 object-cover
            cursor-pointer self-center m-2"/>

            <p className="text-sm self-center">
              {fileUploadError ? (
              <span className="text-red-700">Error Image upload
              (image must be less than 2 mb)
              </span> 
               ):
              filePrec > 0 && filePrec <100 ? (
              <span className="text-slate-700">
                  {`Uploading ${filePrec} %`}
              </span>
             ) : filePrec === 100 ? (
              <span className="text-green-700">
                 Image successfully uploaded</span>
                 ):(
                   ''
                 )       
              }
            </p>
    

            <input type="text" 
            placeholder="username" 
            defaultValue={currentUser.username}
            id="username"
            className="border p-3 rounded-lg" 
              onChange={handleChange}
            />
            
            <input type="email" 
            placeholder="email" 
            defaultValue={currentUser.email}
            id="email"
            className="border p-3 rounded-lg" 
            onChange={handleChange}
            />
            
            <input type="password" 
            placeholder="password" 
            id="password"
            className="border p-3 rounded-lg" 
            onChange={handleChange}
            />

            <button disabled={loading} className="bg-slate-700 text-white
            rounded-lg p-3 uppercase hover:opacity-95
            disabled: opacity-80">
            {loading ? 'Loading...' : 'Update'}
            </button>

            <Link className="bg-green-700 text-white p-3 rounded-lg 
            uppercase text-center hover:opacity-95" to={"/create-listing"}>
               Create Listing
            </Link>
      </form>

      <div className="flex justify-between mt-5">
           <span onClick={handleDeleteUser} 
           className="text-red-700 cursor-pointer">
            Delete Account
            </span>

           <span onClick={handleSignOut} 
           className="text-red-700 cursor-pointer">
            Sign Out
            </span>
      </div>
      {/* console.log({error}) */}
         <p className="text-red-700 mt-5">{error ? error : ''}</p>
         <p className="text-green-700 mt-5">{updateSuccess ? 'Profile is updated successfully'  : ''}</p>

         <button type="button" onClick={handleShowListings} className="text-green-700 w-full">Show listings</button>
         <p className="text-red-700 mt-5">{showListingsError ? 'Error showing listings' : ''}</p>
         
         {userListings && userListings.length > 0 &&
               
         <div className=" flex flex-col gap-3">
              <h1 className="text-center mt-7 text-2xl font-semibold">Your Listings</h1>
           {  userListings.map((listing) => <div key={listing._id} className="
               border rounded-lg p-3 flex justify-between items-center gap-4">
                     <Link to={`/listing/${listing._id}`}>
                        <img src={listing.imageUrls[0]} alt="listing cover" 
                        className="h-16 w-16 object-fill
                        rounded-sm"/>
                     </Link>
                     <Link className="flex-1 text-slate-700 font-semibold 
                         hover:underline truncate" to={`/listing/${listing._id}`}>
                        <p>{listing.name}</p>
                     </Link>
                     
                     <div className="flex flex-col items-center">
                         <button onClick={()=> handleListingDelete(listing._id)} className="text-red-700 uppercase">Delete</button>
                         <p className="text-red-700 mt-4 text-sm">{oneListingError ? 'Error showing listing' : ''}</p>
                        
                         <Link to={`/update-listing/${listing._id}`}>
                         <button className="text-green-700 uppercase">Edit</button>
                         </Link>
                     </div>
                  </div>
           )}
         </div>}
    </div>
 )

}
