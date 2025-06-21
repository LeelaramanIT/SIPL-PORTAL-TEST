import React from 'react'
import ThemeSwitcher from '../../components/ThemeSwitcher'
import DarkModeToggle from '../../components/DarkModeToggle/DarkModeToggle'

const Settings = () => {
  return (
    <div className='p-6 max-w-4xl mx-auto'>
      <h1 className='text-2xl font-bold text-[var(--color-primary)] mb-6'>Settings</h1>
      
      <div className='space-y-6'>
        {/* Theme Settings Section */}
        <div className='bg-[var(--color-background)] p-6 rounded-lg border border-[var(--color-secondary)]'>
          <h2 className='text-lg font-semibold text-[var(--color-primary)] mb-4'>Appearance</h2>
          
          <div className='space-y-4'>
            {/* Color Theme */}
            <div>
              <label className='block text-sm font-medium text-[var(--color-text)] mb-2'>
                Color Theme
              </label>
              <div className='flex items-center gap-4'>
                <ThemeSwitcher variant="navbar" />
                <span className='text-sm text-[var(--color-text)] opacity-75'>
                  Choose your preferred color scheme
                </span>
              </div>
            </div>
            
            {/* Dark Mode Toggle */}
            <div>
              <label className='block text-sm font-medium text-[var(--color-text)] mb-2'>
                Dark Mode
              </label>
              <div className='flex items-center gap-4'>
                <DarkModeToggle />
                <span className='text-sm text-[var(--color-text)] opacity-75'>
                  Toggle between light and dark mode
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Other Settings Sections */}
        <div className='bg-[var(--color-background)] p-6 rounded-lg border border-[var(--color-secondary)]'>
          <h2 className='text-lg font-semibold text-[var(--color-primary)] mb-4'>Account</h2>
          <p className='text-[var(--color-text)] opacity-75'>Account settings will be available here</p>
        </div>
        
        <div className='bg-[var(--color-background)] p-6 rounded-lg border border-[var(--color-secondary)]'>
          <h2 className='text-lg font-semibold text-[var(--color-primary)] mb-4'>Notifications</h2>
          <p className='text-[var(--color-text)] opacity-75'>Notification preferences will be available here</p>
        </div>
      </div>
    </div>
  )
}

export default Settings
