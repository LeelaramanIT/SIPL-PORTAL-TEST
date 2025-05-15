import React from 'react'

const AdditionalDetailsForm = () => {
  return (
    <div className="p-4 bg-gray-100 border rounded-md space-y-4">
      <h3 className="text-lg font-semibold">Additional Details</h3>
      <input
        type="text"
        placeholder="Enter remarks..."
        className="w-full p-2 border rounded"
      />
      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-500"
        >
          Done
        </button>
      </div>
    </div>
  )
}

export default AdditionalDetailsForm
