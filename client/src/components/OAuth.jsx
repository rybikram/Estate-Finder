import {GoogleAuthProvider, getAuth, signInWithPopup} from 'firebase/auth'
import { app } from '../firebase'
import { useDispatch } from 'react-redux'
import { signInSuccess } from '../redux/user/userSlice'
import { useNavigate } from 'react-router-dom'


export default function OAuth() {

const dispatch =  useDispatch()
const navigate = useNavigate()

const handleGoogleClick = async () =>{
   try {
    const provider = new GoogleAuthProvider()
    const auth = getAuth(app)                          //here this app from firebase

    const result  = await signInWithPopup(auth, provider)
    // console.log(result)

    const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: result.user.displayName, 
          email: result.user.email,  
          photo: result.user.photoURL
        })
    })
    const data = await res.json()
    dispatch(signInSuccess(data))
    // console.log(data)
    navigate('/')

   } catch (error) {
    console.log('Could not sing in with google', error)     //hence we do not want to show any error to the user
   }
} 

  return (
    //below taking the type=button hence it will not submit the form will work as a button
    <button onClick={handleGoogleClick} type="button" 
    className='bg-red-700 text-white p-3 rounded-lg uppercase hover:opacity-95'>
    Continue wth google</button>   
  )
}
