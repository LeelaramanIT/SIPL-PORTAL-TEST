import React from 'react'

const UserPrivilege = () => {
  return (
    <div className='p-6 max-w-7xl mx-auto'>
      <h1 className='text-2xl font-bold text-[var(--color-primary)] mb-6'>User Privileges</h1>
      
      <div className='bg-[var(--color-background)] p-6 rounded-lg border border-[var(--color-secondary)]'>
        <h2 className='text-lg font-semibold text-[var(--color-primary)] mb-4'>Manage User Permissions</h2>
        <p className='text-[var(--color-text)] opacity-75'>
          Configure user privileges and access permissions for different roles in the system.
        </p>
      </div>
    </div>
  )
}

export default UserPrivilege
