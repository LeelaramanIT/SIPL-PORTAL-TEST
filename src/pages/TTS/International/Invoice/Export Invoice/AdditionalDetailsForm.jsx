import { useForm } from "react-hook-form";
import Button from "../../../../../components/InputFields/Button";
import Input from "../../../../../components/InputFields/Input";
import Select from "../../../../../components/InputFields/Select";
import TextArea from "../../../../../components/InputFields/TextArea";
import LoadingButton from "../../../../../components/LoadingButton";

const AdditionalDetailsForm = ({ onClose, handleCloseForm }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
  console.log("Form submitted:", data);
  console.log("isSubmitting before delay:", isSubmitting);

  // Simulate async delay (e.g., API call)
  await new Promise((resolve) => setTimeout(resolve, 9000)); // 2 seconds

  console.log("isSubmitting after delay:", isSubmitting);

  reset();
  onClose();
};


  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="text-sm mt-6 text-gray-800 dark:text-gray-200 w-full grid grid-cols-1 md:grid-cols-3 gap-4 "
    >
      {/* Input fields */}
      <InputField label="Username" name="userName" register={register} errors={errors} />
      <InputField label="Password" name="password" register={register} errors={errors} />
      <InputField label="Phone Number" name="phoneNo" register={register} errors={errors} />
      <InputField label="Email" name="email" register={register} errors={errors} />
      <InputField label="First Name" name="firstName" register={register} errors={errors} />
      <InputField label="Last Name" name="lastName" register={register} errors={errors} />
      <InputField label="City" name="city" register={register} errors={errors} />
      <InputField label="State" name="state" register={register} errors={errors} />
      <InputField label="Zip Code" name="zip" register={register} errors={errors} />
      <InputField label="Company" name="company" register={register} errors={errors} />
      <InputField label="Position" name="position" register={register} errors={errors} />

      {/* Select Fields */}
      <SelectField label="Vehicle Type" name="vehicleType" register={register} errors={errors} options={["Truck", "Bus", "Car", "Van"]} />
      <SelectField label="Gender" name="gender" register={register} errors={errors} options={["Male", "Female", "Other"]} />
      <SelectField label="Department" name="department" register={register} errors={errors} options={["HR", "Engineering", "Marketing"]} />
      <SelectField label="Role" name="role" register={register} errors={errors} options={["Admin", "User", "Manager"]} />

      {/* Text Areas */}
      <div className="col-span-2">
        <TextArea
          label="Description"
          placeholder="Enter description..."
          {...register("description", { required: "Description is required" })}
        />
        {errors.description && <ErrorText message={errors.description.message} />}
      </div>

      <div className="col-">
        <TextArea
          label="Remarks"
          placeholder="Additional remarks..."
          {...register("remarks", { required: "Remarks are required" })}
        />
        {errors.remarks && <ErrorText message={errors.remarks.message} />}
      </div>

      {/* Buttons */}
      <div className="col-span-full flex justify-end gap-2 pt-4">
        <Button
          type="button"
          text="Cancel"
          onClick={() => {
            if (onClose) onClose();
            if (handleCloseForm) handleCloseForm();
          }}
          disabled={isSubmitting}
        />
        {isSubmitting ?<LoadingButton className={'p-1'} text={'Submiting...'} />:<Button type="submit" text="Submit" disabled={isSubmitting} />}
      </div>
    </form>
  );
};

const InputField = ({ label, name, register, errors }) => (
  <div>
    <Input
      label={label}
      name={name}
      {...register(name, { required: `${label} is required` })}
    />
    {errors[name] && <ErrorText message={errors[name].message} />}
  </div>
);

const SelectField = ({ label, name, register, errors, options }) => (
  <div>
    <Select
      label={label}
      name={name}
      {...register(name, { required: `Please select a ${label.toLowerCase()}` })}
    >
      <option className="dark:bg-gray-900 dark:text-white" value="" disabled hidden>
        Select {label}
      </option>
      {options.map((option) => (
        <option key={option} className="dark:bg-gray-900 dark:text-white" value={option.toLowerCase()}>
          {option}
        </option>
      ))}
    </Select>
    {errors[name] && <ErrorText message={errors[name].message} />}
  </div>
);

const ErrorText = ({ message }) => (
  <p className="text-red-500 text-xs mt-1">{message}</p>
);

export default AdditionalDetailsForm;
