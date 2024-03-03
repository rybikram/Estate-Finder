import React, { useEffect, useState } from 'react'
import {FaSearch} from 'react-icons/fa'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector }  from 'react-redux'


export default function Header() {

const {currentUser} = useSelector(state => state.user)                  //here user is coming from userSlice
const [searchTerm, setSearchTerm] = useState('')
const navigate = useNavigate()


const handleSubmit = (e) =>{
      e.preventDefault()
  const urlParams = new URLSearchParams(window.location.search)    //this is an built in function. This is for when we search the keyword in the search box the existing url will not change 
  urlParams.set('searchTerm', searchTerm)
  const searchQuery = urlParams.toString()
  navigate(`/search?${searchQuery}`)
}

useEffect(()=>{
      //below we are trying to take the searchterm from the url to the search box
     const urlParams = new URLSearchParams(location.search) 
     const searchTermFromUrl = urlParams.get('searchTerm')

     if(searchTermFromUrl){
      setSearchTerm(searchTermFromUrl)
     }
}, [location.search])



  return (
     <header className='bg-slate-200'>
        <div className='flex justify-between items-center max-w-6xl mx-auto p-3'>

        <Link to='/'>
        <h1 className='font-bold text-sm sm:text-xl flex flex-wrap'>
              <span className='text-slate-600'>Estate</span>
              <span className='text-blue-400'> Finder</span>
        </h1>
        </Link>   

        <form onSubmit={handleSubmit} className='bg-slate-100 p-3 rounded-xl  flex items-center'>
              <input 
              type='text'
              placeholder='Search...'
              className='bg-transparent focus:outline-none w-64 sm:w-64'
              value={searchTerm}
              onChange={(e)=> setSearchTerm(e.target.value)}
              />
              <button>
                  <FaSearch className='text-slate-600'/>
              </button>
        </form>
        
        <ul className='flex gap-4'>
              <Link to= '/'>
               <li className='hidden sm:inline text-slate-700 hover:underline'>Home</li>
               </Link>

               <Link to= '/about'>
               <li className='hidden sm:inline text-slate-700 hover:underline'>About</li>
               </Link>

               <Link to='/profile'>
                  { currentUser ?(
                  <img className='rounded-full h-7 w-7 objet-cover' src={currentUser.avatar} alt='profile' />
                  ) : (
                        <li className='text-slate-700 hover:underline'>Sign in</li>
                  )}
               </Link>
        </ul>
        </div>
     </header>
    )
}
