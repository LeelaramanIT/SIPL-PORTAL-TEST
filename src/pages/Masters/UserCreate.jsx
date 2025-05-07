import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

const UserCreate = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = (data) => {
    console.log("Submitted Data:", data);
    toast.success("User details submitted successfully!");
    reset();
  };

  return (
    <div className="w-full mx-auto p-6 bg-white rounded-t-2xl shadow-lg h-full">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-h-[80vh] overflow-y-auto">
          {/* GST Information */}
          <div className="col-span-4">
            <h3 className="text-lg font-semibold">GST Information</h3>
          </div>

          {[
            "GST Number",
            "Trade Name",
            "Legal Name",
            "State Code",
            "Constitution of Business",
            "Taxpayer Type",
            "Registration Date",
            "Principal Place of Business",
            "Additional Place of Business",
            "Contact Person Name",
          ].map((field, index) => (
            <div className="relative z-0" key={index}>
              <input
                type="text"
                {...register(field.toLowerCase().replace(/ /g, "_"), {
                  required: `${field} is required`,
                })}
                className="peer block w-full appearance-none border-0 border-b border-gray-500 bg-transparent py-2.5 px-0 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0"
                placeholder=" "
              />
              <label
                className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 
            peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100
            peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-blue-600"
              >
                {field}
              </label>
            </div>
          ))}
          
          <div className="col-span-4">
            {/* Submit Button */}
            <div className="col-span-4 flex justify-end mt-6 pt-4">
              <button
                type="submit"
                className="bg-slate-800 text-white w-20 py-2 rounded-lg hover:bg-slate-700 transition duration-300"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UserCreate;
