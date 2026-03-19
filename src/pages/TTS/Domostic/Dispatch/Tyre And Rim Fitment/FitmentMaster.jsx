import React from 'react'
import FitmentHeader from './FitmentHeader'
import { Outlet } from 'react-router-dom'

const FitmentMaster = () => {
    return (
        <div className='w-full h-full flex flex-col overflow-hidden p-2 sm:p-3 bg-gray-50 dark:bg-slate-900'>
            <FitmentHeader />
            <Outlet/>
        </div>
    )
}

export default FitmentMaster