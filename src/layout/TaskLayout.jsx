import React from 'react'
import { Outlet } from 'react-router-dom'

const TaskLayout = () => {
  return (
    <div className="w-full bg-[#ECECEC] dark:bg-gray-900 p-2 flex flex-col shadow-2xl overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-md">
          Navbar
      </div>  
      <Outlet />
    </div>
  )
}

export default TaskLayout
