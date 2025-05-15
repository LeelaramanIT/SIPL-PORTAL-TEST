import React from "react";
import { IoMdSearch } from "react-icons/io";

const SearchBar = ({ placeholder = "Search...", onSearch, value, onChange }) => {
  return (
    <div className="flex relative w-full md:w-[60%] lg:w-[40%]">
      <input
        onKeyDown={(e) => {
          if (e.key === "Enter") onSearch();
        }}
        className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pl-3 pr-28 py-2 transition duration-300 ease-in-out focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      <button
        className="absolute top-1 right-1 flex items-center rounded bg-slate-800 py-1 px-2.5 border border-transparent text-sm text-white transition-all shadow-sm hover:bg-slate-700"
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
