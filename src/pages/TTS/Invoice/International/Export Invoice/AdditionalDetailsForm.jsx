import { useForm } from "react-hook-form";
import TitleText from "../../../../../components/TitleText";
import { IoClose } from "react-icons/io5";

const AdditionalDetailsForm = ({ onClose }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  return (
    <div className="p-4 bg-white dark:bg-gray-900 rounded-md shadow-md">
      <div className="flex justify-between items-center mb-6 relative">
        <TitleText title={"Additional Details"} />
        <button
          onClick={onClose}
          className="absolute right-0 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <IoClose className="text-2xl"/>
        </button>
      </div>

      <form
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        onSubmit={handleSubmit((data) => {
          console.log(data);
          reset();
          onClose();
        })}
      >
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
              className="peer block w-full appearance-none border-0 border-b border-gray-500 bg-transparent py-2.5 px-0 text-sm 
              text-gray-900 dark:text-white focus:border-blue-600 focus:outline-none focus:ring-0"
              placeholder=" "
            />
            <label
              className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 dark:text-gray-400 
              duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100
              peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-blue-600 dark:peer-focus:text-blue-400"
            >
              {field}
            </label>
            {errors[field.toLowerCase().replace(/ /g, "_")] && (
              <p className="mt-1 text-xs text-red-500">
                {errors[field.toLowerCase().replace(/ /g, "_")].message}
              </p>
            )}
          </div>
        ))}

        <div className="col-span-full flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdditionalDetailsForm;
