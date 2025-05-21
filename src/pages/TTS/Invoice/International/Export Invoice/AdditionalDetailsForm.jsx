import { useForm } from "react-hook-form";
import Button from "../../../../../components/Button";

const AdditionalDetailsForm = ({ onClose }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = (data) => {
    console.log(data);
    reset();
    onClose();
  };

  return (
    <form
      className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4"
      onSubmit={handleSubmit(onSubmit)}
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
        "Contact Person Email",
        "Contact Person Phone",
      ].map((field, index) => {
        const fieldName = field.toLowerCase().replace(/ /g, "_");

        return (
          <div className="relative z-0" key={index}>
            <input
              type="text"
              {...register(fieldName, {
                required: `${field} is required`,
              })}
              className="peer block w-full appearance-none border-0 border-b border-gray-500 dark:border-gray-400 bg-transparent py-2.5 px-0 text-sm 
              text-gray-900 dark:text-white focus:border-blue-600 dark:focus:border-blue-400 focus:outline-none focus:ring-0"
              placeholder=" "
            />
            <label
              className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 dark:text-gray-400 
              duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100
              peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-blue-600 dark:peer-focus:text-blue-400"
            >
              {field}
            </label>
            {errors[fieldName] && (
              <p className="mt-1 text-xs text-red-500">
                {errors[fieldName].message}
              </p>
            )}
          </div>
        );
      })}

      <div className="col-span-full flex justify-end gap-3 mt-4">
        <Button
          onClick={onClose}
          className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
          text="Cancel"
          type="button"
        />
        <Button
          className="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white"
          text="Save"
          type="submit"
        />
      </div>
    </form>
  );
};

export default AdditionalDetailsForm;
