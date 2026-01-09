import React, { forwardRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CiCalendarDate } from "react-icons/ci";
import { IoMdSearch } from "react-icons/io";
import "./DatePicker.css";

const CustomInput = forwardRef(({ value, onClick }, ref) => (
  <button
    type="button"
    onClick={onClick}
    ref={ref}
    className="w-full z-50 bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pl-10 pr-28 py-2 transition duration-300 ease-in-out focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow flex items-center text-left relative"
    aria-label="Select date"
  >
    <CiCalendarDate className="absolute left-3 text-lg text-slate-600" />
    <span className={value ? "" : "text-slate-400"}>
      {value || "Search Date"}
    </span>
  </button>
));

const DatePickerComponent = ({ startDate, handleDateChange, onSearch }) => {
  return (
    <div className="flex relative w-full md:w-[60%] lg:w-[33%] ml-1">
      <DatePicker
        selected={startDate}
        onChange={handleDateChange}
        dateFormat="yyyy-MM-dd"
        customInput={<CustomInput />}
        popperClassName="z-[9999]"
        showYearDropdown
        scrollableYearDropdown
        showMonthDropdown
        minDate={new Date("2000-01-01")}
        maxDate={new Date("2030-12-31")}
      />
      <button
        className="absolute top-1 right-1 flex items-center rounded bg-slate-800 py-1 px-2.5 border border-transparent text-sm text-white transition-all shadow-sm hover:bg-slate-700"
        type="button"
        onClick={onSearch}
        aria-label="Search by selected date"
      >
        <IoMdSearch className="w-5 h-5 mr-2" />
        Search
      </button>
    </div>
  );
};

export default DatePickerComponent;
