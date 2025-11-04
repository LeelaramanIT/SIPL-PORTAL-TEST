import React from "react";
import assets from "../assets/assets";

const LoadingButton = ({className, text}) => {
  return (
      <button
        disabled
        type="button"
        className={`${className} flex justify-center items-center select-none rounded-md`}
      >
        <img src={assets.LoadingAnimation} className="w-[2rem] h-[1.5rem]"/>
        {text}
      </button>
  );
};

export default LoadingButton;
