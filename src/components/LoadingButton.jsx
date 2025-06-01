import React from "react";
import assets from "../assets/assets";

const LoadingButton = ({className, text}) => {
  return (
      <button
        disabled
        type="button"
        className={`${className} flex justify-center items-center select-none bg-slate-900 hover:bg-slate-800 rounded-md text-white`}
      >
        <img src={assets.LoadingAnimation} className="w-[2rem] h-[1.5rem] text-white"/>
        {text}
      </button>
  );
};

export default LoadingButton;
