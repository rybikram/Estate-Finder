import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Home from './Pages/Home'
import SignIn from './Pages/SignIn'
import SignUp from './Pages/SignUp'
import About from './Pages/About'
import Profile from './Pages/Profile'
import Header from './components/Header'
import PrivateRoute from './components/PrivateRoute'
import CreateListing from './Pages/CreateListing'


function App() {
  return <BrowserRouter>
  <Header />
  <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/sign-in' element={<SignIn />} />
      <Route path='/sign-up' element={<SignUp />} />
      <Route path='/about' element={<About />} />

      <Route element= {<PrivateRoute />} >
             <Route path='/profile' element={<Profile />} />     
             <Route path='/create-listing' element={<CreateListing />} />
      </Route>
  </Routes>
 </BrowserRouter>
}

export default App


//Line number 25 is called children using as outlet of PrivateRoute