import { useForm } from "react-hook-form";
import Button from "../../../../../components/Button";

const ShipmentDetailsForm = ({ onClose }) => {
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
    <>
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-sm text-gray-800 dark:text-gray-200">
          </form>
    </>
  );
};


export default ShipmentDetailsForm;
