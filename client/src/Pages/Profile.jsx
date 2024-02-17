import { useDispatch, useSelector } from "react-redux"
import { useEffect, useRef, useState } from "react"
import {getDownloadURL, getStorage, ref, uploadBytesResumable} from 'firebase/storage'
import { app } from "../firebase"
import { updateUserFailure, updateUserStart, updateUserSuccess } from "../redux/user/userSlice"

export default function Profile() {

const {currentUser, loading, error} = useSelector((state) => state.user)
const fileRef = useRef(null)
const [file, setFile] = useState(undefined)
const [filePrec, setFilePerc] = useState(0)
const [fileUploadError, setFileUploadError] = useState(false)
const [formData, setFormData] = useState({})         //empty object
const [updateSuccess, setUpdateSuccess] = useState(false)
const dispatch = useDispatch()
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
   console.log(currentUser._id)
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
         console.log(data)
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
      </form>

      <div className="flex justify-between mt-5">
           <span className="text-red-700 cursor-pointer">Delete Account</span>
           <span className="text-red-700 cursor-pointer">Sign Out</span>
      </div>
         <p className="text-red-700 mt-5">{error ? error : ''}</p>
         <p className="text-green-700 mt-5">{updateSuccess ? 'Profile is updated successfully'  : ''}</p>
    </div>
 )

}
