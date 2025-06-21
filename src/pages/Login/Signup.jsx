import React from 'react'

const Signup = () => {
  return (
    <div className='p-6 max-w-4xl mx-auto'>
      <h1 className='text-2xl font-bold text-[var(--color-primary)] mb-6'>Sign Up</h1>
      
      <div className='bg-[var(--color-background)] p-6 rounded-lg border border-[var(--color-secondary)]'>
        <h2 className='text-lg font-semibold text-[var(--color-primary)] mb-4'>Create Account</h2>
        <p className='text-[var(--color-text)] opacity-75'>
          Create a new account to access the system.
        </p>
      </div>
    </div>
  )
}

export default Signup
