import React from "react";
import { IoMdSearch } from "react-icons/io";

const SearchBar = ({ placeholder = "Search...", onSearch, value, onChange }) => {
  return (
    <div className="relative w-full flex items-center">
      <input
        onKeyDown={(e) => {
          if (e.key === "Enter") onSearch?.();
        }}
        className="
          w-full
          pl-3 pr-9 sm:pr-24
          py-1.5 sm:py-[7px]
          text-[0.65rem] sm:text-[0.7rem] md:text-xs
          rounded-md
          shadow-sm
          transition duration-300 ease-in-out
          focus:outline-none focus:shadow

          bg-white
          text-slate-700
          placeholder:text-slate-400
          border border-slate-200
          focus:border-slate-400
          hover:border-slate-300

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
          absolute top-1/2 -translate-y-1/2 right-1
          flex items-center justify-center
          rounded
          w-7 h-[calc(100%-6px)] sm:w-auto sm:h-auto
          sm:px-2.5 sm:py-1
          text-[0.6rem] sm:text-[0.65rem] md:text-[0.7rem]
          text-white
          border border-transparent
          shadow-sm transition-all
          whitespace-nowrap

          bg-[var(--primary)]
          hover:bg-[var(--primary-hover)]

          dark:bg-slate-700
          dark:hover:bg-slate-600
          dark:border-slate-600
        "
        type="button"
        onClick={onSearch}
      >
        <IoMdSearch className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1.5 flex-shrink-0" />
        <span className="hidden sm:inline">Search</span>
      </button>
    </div>
  );
};

export default SearchBar;