import React from "react";
import { IoMdSearch } from "react-icons/io";

const SearchBar = ({ placeholder = "Search...", onSearch, value, onChange }) => {
  return (
    <div className="relative w-full">
      <input
        onKeyDown={(e) => {
          if (e.key === "Enter") onSearch();
        }}
        className="
            w-full 
            pl-3 pr-28 py-[7px]  ml-1
            text-[0.7rem] 
            rounded-md 
            shadow-sm 
            transition duration-300 ease-in-out 
            focus:outline-none focus:shadow
            
            /* Light Mode Styles */
            bg-white 
            text-slate-700 
            placeholder:text-slate-400 
            border border-slate-200 
            focus:border-slate-400 
            hover:border-slate-300 
            
            /* Dark Mode Styles */
            dark:bg-slate-900 
            dark:text-slate-200 
            dark:placeholder:text-slate-500 
            dark:border-slate-700 
            dark:focus:border-slate-500 
            dark:hover:border-slate-600
        "
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      
      <button
        className="
            absolute top-[3px] right-1 
            flex items-center 
            rounded 
            py-1 px-2.5 
            text-[0.7rem] text-white 
            border border-transparent 
            shadow-sm transition-all 
            
            /* Light Mode Button */
            bg-[var(--primary)] 
            hover:bg-[var(--primary-hover)] 
            
            /* Dark Mode Button */
            dark:bg-slate-700 
            dark:hover:bg-slate-600
            dark:border-slate-600
        "
        type="button"
        onClick={onSearch}
      >
        <IoMdSearch className="w-4 h-4 mr-2" />
        Search
      </button>
    </div>
  );
};

export default SearchBar;