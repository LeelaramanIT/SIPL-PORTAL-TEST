import React from 'react'

const Dashboard = () => {
  return (
    <div className='p-6 max-w-7xl mx-auto'>
      <h1 className='text-2xl font-bold text-[var(--color-primary)] mb-6'>Dashboard</h1>
      
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {/* Welcome Card */}
        <div className='bg-[var(--color-background)] p-6 rounded-lg border border-[var(--color-secondary)]'>
          <h2 className='text-lg font-semibold text-[var(--color-primary)] mb-4'>Welcome</h2>
          <p className='text-[var(--color-text)] opacity-75'>
            Welcome to your dashboard. Here you can view your key metrics and recent activities.
          </p>
        </div>
        
        {/* Quick Stats */}
        <div className='bg-[var(--color-background)] p-6 rounded-lg border border-[var(--color-secondary)]'>
          <h2 className='text-lg font-semibold text-[var(--color-primary)] mb-4'>Quick Stats</h2>
          <div className='space-y-2'>
            <p className='text-[var(--color-text)] opacity-75'>Total Users: 1,234</p>
            <p className='text-[var(--color-text)] opacity-75'>Active Sessions: 56</p>
            <p className='text-[var(--color-text)] opacity-75'>Today's Revenue: $12,345</p>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className='bg-[var(--color-background)] p-6 rounded-lg border border-[var(--color-secondary)]'>
          <h2 className='text-lg font-semibold text-[var(--color-primary)] mb-4'>Recent Activity</h2>
          <div className='space-y-2'>
            <p className='text-[var(--color-text)] opacity-75'>New user registered</p>
            <p className='text-[var(--color-text)] opacity-75'>Invoice #1234 created</p>
            <p className='text-[var(--color-text)] opacity-75'>Payment received</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
