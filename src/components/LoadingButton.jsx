import React from "react";
import assets from "../assets/assets";

const LoadingButton = () => {
  return (
    <div>
      <button
        disabled
        type="button"
        className="w-full flex justify-center items-center select-none py-2 px-4 bg-slate-900 hover:bg-slate-800 rounded-md text-white"
      >
        <img src={assets.LoadingAnimation} className="w-[2rem] h-[1.5rem] text-white"/>
        Loading...
      </button>
    </div>
  );
};

export default LoadingButton;
