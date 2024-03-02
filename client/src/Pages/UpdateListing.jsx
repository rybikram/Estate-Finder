import React, { useEffect } from 'react'
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage"
import {useState} from "react"
import { app } from '../firebase'
import {useSelector} from 'react-redux'
import {useNavigate, useParams} from 'react-router-dom'

export default function CreateListing() {

const [files, setFiles] = useState([])    
// console.log(files)
const [formData, setFormData] = useState({
    imageUrls: [],
    name: '',
    description: '',
    address: '',
    type: 'rent',
    bedrooms: 1,
    bathrooms: 1, 
    regularPrice: 50,
    discountPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
})
// console.log(formData)
//This is for image upload in create listing
const [imageUploadError, setImageUploadError] = useState(false)
const [uploading, setUplaoding] = useState(false)

//This is for form onsubmit 
const [error, setError] = useState(false)    
const [loading, setLoading] = useState(false)

const {currentUser} = useSelector( state => state.user)
const navigate = useNavigate()
const params = useParams()            //this is default feature or react router dom, to get the user id from url


useEffect(()=>{
   const fetchListing = async () =>{
       const listingId= params.listingId
    //    console.log(listingId)
      const res = await fetch(`/api/listing/get/${listingId}`)
      const data = await res.json();

      if(data.success === false){
        console.log(data.message)
        return
      }
      setFormData(data)
   }

   fetchListing()
},[])


//For FILE UPLOAD BUTTON
const handleImageSubmit = (e) => {
     if(files.length > 0 && files.length + formData.imageUrls.length < 7){
        setUplaoding(true)
        setImageUploadError(false)

        const promises = []             //this is just a blank array
// console.log(files.length + formData.imageUrls.length)
    for(let i= 0; i<files.length; i++){
        promises.push(storeImage(files[i])) 
    }
    Promise.all(promises).then((urls) =>{
        setFormData({                   //here all the final image url will be store
            ...formData, 
            imageUrls: formData.imageUrls.concat(urls)    //so that all the image url will be concatinate one after one
        })
        setImageUploadError(false)
        setUplaoding(false)             //when all the image uploading is completed we set it to false
    }).catch((err)=>{
         setImageUploadError('Image upload failed (2 mb per image)')
         setUplaoding(false)
    })
     }else{
        setImageUploadError('You can only upload 6 image per listing')
        setUplaoding(false)
     }
}

const storeImage = async (file) =>{
 return new Promise((resolve, reject) =>{
    const storage = getStorage(app)     //here app is coming from firebase
    const fileName = new Date().getTime() + file.name
    const storageRef = ref(storage, fileName)
    const uploadTask = uploadBytesResumable(storageRef, file)

      uploadTask.on(
        'state_changed',
            (snapshot) => {
                const progress = 
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                console.log(`Upload is ${progress} done`)
            },
            (error)=>{
                reject(error)
            },
     //if there is no error then below annonymous function to get the download url
            ()=>{
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL)=>{
                resolve(downloadURL)
            })
            }
      )
 })
}


//FOR IMAGE DELETE

const handleRemoveImage = (index) =>{
    //wanna keep inside first
    setFormData({
        ...formData,
        imageUrls: formData.imageUrls.filter((_, i) => i != index)     //we are setting manually as it as a false 
    })
}




const handleChange = (e) => {
   
   //for buy or sell check
    if(e.target.id === 'sale' || e.target.id === 'rent'){
        setFormData({
            ...formData,
            type: e.target.id
        })
    }

  //for parking, furnishe, offer
  if(e.target.id === 'parking' || e.target.id === 'furnished' || e.target.id === 'offer'){
    setFormData({
        ...formData,
        [e.target.id]: e.target.checked
    })
  }


  //for others
  if(e.target.type === 'number' ||
     e.target.type === 'text' ||
     e.target.type === 'textarea'
    ){
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        })
    }
}

const handleSubmit = async (e) =>{
    e.preventDefault()
    try {
    //conditional error handling
        if(formData.imageUrls.length < 1) return setError('You must upload atleast one image')
        if(+formData.regularPrice < +formData.discountPrice) return setError('Discount price must be lower than regular price')   //before + means it will take a number
    //conditional error handling
        setLoading(true)
        setError(false)

        // console.log(params.listingId)
        const res = await fetch(`/api/listing/update/${params.listingId}`, 
        {
            method:'POST',
            headers:{
                'Content-Type' : 'application/json',
        },
        body: JSON.stringify({
                ...formData,
                userRef: currentUser._id,                    //cause when we submit the form data need to identity the specific user by it id
            })
       })

        const data = await res.json();
        setLoading(false)

           if(data.success === false){
             setError(data.message)
           }
           navigate(`/listing/${data._id}`)      //here this id is generating when the create listing is completed(this is not the user id)
    } catch (error) {
        setError(error.message)
        setLoading(false)
    }

}

  return (
    //below main is for seo friendly 
         <main className='p-3 max-w-4xl mx-auto'>     
             <h1 className='text-3xl font-semibold text-center
             my-7'>Update a Listing</h1>

             <form onSubmit={handleSubmit} className='flex flex-col sm:flex-row gap-4'>
                <div className='flex flex-col gap-4 flex-1'>
                    
                    <input type='text' placeholder='Name' className='border p-3 rounded-lg' 
                    id='name' maxLength='62' minLength='10' required 
                    onChange={handleChange} value={formData.name} />
                    
                    <textarea type='text' placeholder='Description' className='border p-3 rounded-lg' 
                    id='description' required 
                    onChange={handleChange} value={formData.description} />
                    
                    <input type='text' placeholder='Address' className='border p-3 rounded-lg' 
                    id='address' required 
                    onChange={handleChange} value={formData.address} />
                
                  <div className='flex gap-6 flex-wrap'>
                         <div className='flex gap-2'>
                             <input type='checkbox' id='sale' className='w-5'
                             onChange={handleChange} 
                             checked={formData.type === 'sale'}
                             />
                             <span>Sell</span>
                        </div>
                         <div className='flex gap-2'>
                             <input type='checkbox' id='rent' className='w-5'
                                onChange={handleChange} 
                                checked={formData.type === 'rent'}
                                />
                             <span>Rent</span>
                        </div>
                         <div className='flex gap-2'>
                             <input type='checkbox' id='parking' className='w-5'
                             onChange={handleChange}
                             checked={formData.parking}
                             />
                             <span>Parking Spot</span>
                        </div>
                         <div className='flex gap-2'>
                             <input type='checkbox' id='furnished' className='w-5'
                             onChange={handleChange}
                             checked={formData.furnished}
                             />
                             <span>Furnished</span>
                        </div>
                         <div className='flex gap-2'>
                             <input type='checkbox' id='offer' className='w-5'
                              onChange={handleChange}
                              checked={formData.offer}
                              />
                             <span>Offer</span>
                        </div>
                  </div>

                  <div className='flex flex-wrap gap-6'>
                        <div className='flex items-center gap-2'>
                            <input type='number' id='bedrooms' min='1' max='10' required 
                            className='p-3 border border-green-300 rounded-lg' 
                            onChange={handleChange}
                            value={formData.bedrooms}
                            />
                            <p>Beds</p>   
                        </div>
                        <div className='flex items-center gap-2'>
                            <input type='number' id='bathrooms' min='1' max='10' required 
                            className='p-3 border border-green-300 rounded-lg' 
                            onChange={handleChange}
                            value={formData.bathrooms}
                            />
                            <p>Baths</p>   
                        </div>
                        
                        <div className='flex items-center gap-2'>
                            <input type='number' id='regularPrice' 
                            min='50' max='100000' required 
                            className='p-3 border border-green-300 rounded-lg' 
                            onChange={handleChange}
                            value={formData.regularPrice}/>
                            <div className='flex flex-col items-center'>
                            <p>Regular Price</p>   
                            <span className='text-xs'>$ / month</span>
                            </div>
                        </div>

                        { formData.offer && (
                            <div className='flex items-center gap-2'>
                            <input type='number' id='discountPrice' 
                            min='0' max='100000' required 
                            className='p-3 border border-green-300 rounded-lg' 
                            onChange={handleChange}
                            value={formData.discountPrice}/>
                            <div className='flex flex-col items-center'>
                            <p>Discounted Price</p>   
                            <span className='text-xs'>$ / month</span>
                            </div>
                        </div>
                        )}
                  </div>
                </div>    

                <div className='flex flex-col flex-1 gap-4'>
                    <p className='font-semibold'>Image:
                    <span className='font-normal text-gray-600 ml-2'>The first image will be the cover (max 6)</span>
                    </p>

                    <div className='flex gap-4'>
                        <input onChange={(e)=> setFiles(e.target.files)} className='p-3 border border-gray-300 rounded w-full'
                        type="file" id='images' accept='image/*' multiple />
                        
                        <button type="button" onClick={handleImageSubmit} disabled={uploading}
                        className='p-3 text-green-700 border border-green-600
                        rounded uppercase hover:shadow-lg disabled:opacity-65'>
                        {uploading ? 'Uploading...' : 'Upload'}
                        </button>
                    </div>
                    <p className="text-red-700 text-sm">{imageUploadError && imageUploadError}</p>
                    {
                         formData.imageUrls.length > 0 && formData.imageUrls.map((url, index) =>{
                          return  <div key={url} className='flex justify-between p-3 border item-center'>
                            <img src={url} alt='listing image' 
                            className='w-20 h-20 object-contain 
                            rounded-lg' />

                            <button onClick={() => handleRemoveImage(index)} 
                            type='button' className='p-3 text-red-700 rounded-lg
                            uppercase hover:opacity-75'>Delete</button>
                            </div>
                         })
                            
                    }   
                <button disabled={loading || uploading}
                 className='p-3 bg-slate-700 text-white rounded-lg
                uppercase hover:opacity-95 disabled:opacity-80' >
                    {loading ? 'Creating...' : 'Update listing'}
                </button>
                    {error && <p className='text-red-700 text-sm'>{error}</p>}
                </div>  
             </form>
         </main>
    )
}