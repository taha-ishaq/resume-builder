import React, { Suspense } from 'react'
import  {Header, Mainspinner}  from '../components'
import {BrowserRouter as Router, Routes,Route } from 'react-router-dom'
import { HomeContainer } from '../containers'
import CreateTemplate from '../pages/CreateTemplate'
import UserProfile from './UserProfile'
import CreateResume from './CreateResume'
import TemplateDesignPinDetails from './TemplateDesignPinDetails'

function Homescreen() {
  return (
    <div className='w-full flex  flex-col  items-center justify-center'>

      {/*header*/}
      <Header />
      <main className='w-full'>
        <Suspense fallback={<Mainspinner />}>
        
            <Routes>
              <Route path='/' element={<HomeContainer />}></Route>
              <Route path="/template/create" element={<CreateTemplate />}></Route>
              <Route path="/profile/:uid" element={<UserProfile />}></Route>
              <Route path="/resume/*" element={<CreateResume />}></Route>
              <Route path="/resumeDetail/:templateID" element={<TemplateDesignPinDetails />}></Route>
            </Routes>
          
        </Suspense>
        </main> 
       
    </div>
  )
}

export default Homescreen