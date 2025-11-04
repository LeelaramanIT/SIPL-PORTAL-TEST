import React from 'react'
import { Outlet } from 'react-router-dom'

const ReportsLayout = () => {
  return (
    <div className='w-full p-2 bg-gray-50 h-full'>
        <Outlet/>
    </div>
  )
}

export default ReportsLayout