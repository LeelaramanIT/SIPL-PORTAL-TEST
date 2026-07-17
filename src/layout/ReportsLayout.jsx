import React from 'react'
import { Outlet } from 'react-router-dom'

const ReportsLayout = () => {
  return (
    <div className='w-full min-w-0 overflow-x-hidden p-2 bg-gray-50 h-full'>
        <Outlet/>
    </div>
  )
}

export default ReportsLayout