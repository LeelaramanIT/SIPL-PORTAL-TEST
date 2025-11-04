import React from "react";
import { IoMdSearch } from "react-icons/io";

const SearchBar = ({ placeholder = "Search...", onSearch, value, onChange }) => {
  return (
    <div className="flex relative w-full md:w-[60%] lg:w-[40%]">
      <input
        onKeyDown={(e) => {
          if (e.key === "Enter") onSearch();
        }}
        className="w-full bg-transparent placeholder:text-slate-400 dark:placeholder:text-slate-700 text-slate-700 dark:text-slate-700 text-sm border border-slate-200 dark:border-gray-600 rounded-md pl-3 pr-28 py-2 transition duration-300 ease-in-out focus:outline-none focus:border-slate-400 dark:focus:border-gray-400 hover:border-slate-300 dark:hover:border-gray-500 shadow-sm focus:shadow"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      <button
        className="absolute top-1 right-1 flex items-center rounded bg-[var(--primary)] dark:bg-gray-700 py-1 px-2.5 border border-transparent text-sm text-white transition-all shadow-sm hover:bg-[var(--primary-hover)] dark:hover:bg-gray-600"
        type="button"
        onClick={onSearch}
      >
        <IoMdSearch className="w-5 h-5 mr-2" />
        Search
      </button>
    </div>
  );
};

export default SearchBar;
