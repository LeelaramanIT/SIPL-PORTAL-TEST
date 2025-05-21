import React from 'react'

const Button = ({onClick,text,className}) => {
  return (
    <>
      <button
          onClick={onClick}
          className={`bg-slate-800 ${className} text-white py-1.5 px-5 rounded-md hover:bg-slate-700 dark:bg-gray-700 dark:hover:bg-gray-600 transition duration-300 w-full md:w-auto`}
        >
          {text}
        </button>
    </>
  )
}

export default Button
