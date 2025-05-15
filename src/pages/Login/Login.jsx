import React, { useRef, useState } from "react";
import assets from "../../assets/assets";
import { FiEye, FiEyeOff } from "react-icons/fi";
import axios from "axios";

const Login = () => {
  const email = useRef();
  const password = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3000/postdata", {
        email: email.current.value,
        password: password.current.value,
      });
      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div
      className="w-full min-h-screen flex flex-col md:flex-row"
      style={{
        backgroundImage: `url(${assets.company})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Left Side - Shaped Design */}
      <div className="w-[95%] md:w-[50%] h-72 md:h-[97vh] relative flex justify-center items-center rounded-3xl overflow-hidden m-2">
        {/* Glass Effect Overlay */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-md z-0 border border-white/20 rounded-3xl"></div>

        <div className="w-full h-full flex flex-col justify-center items-center z-10 text-white gap-4 p-4 sm:p-6">
          <img
            className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32"
            src={assets.TVSLogo}
            alt="TVS Logo"
          />
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-green-100 text-center">
            Sundaram Industries Pvt Ltd
          </h1>
        </div>
      </div>

      {/* Right Side - Form Section */}
      <div className="w-full md:w-1/2 flex justify-center items-center py-8 md:py-0 px-4 sm:px-6">
        <div className="p-6 sm:p-8 rounded-lg shadow-2xl w-full max-w-md backdrop-blur-md bg-white/30 border border-white/30">
          <h1 className="text-2xl sm:text-xl font-bold text-center text-slate-800 mb-10">
            Sundaram Industries Pvt Ltd
          </h1>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Username Field */}
            <div className="relative">
              <input
                type="text"
                id="username"
                className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-400 appearance-none focus:outline-none focus:ring-0 focus:border-slate-800 peer"
                placeholder=" "
                ref={email}
              />
              <label
                htmlFor="username"
                className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 px-2 mx-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-6 peer-focus:text-slate-800"
              >
                Username
              </label>
            </div>

            {/* Password Field */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-400 appearance-none focus:outline-none focus:ring-0 focus:border-slate-800 peer"
                placeholder=" "
                ref={password}
              />
              <label
                htmlFor="password"
                className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10  px-2 mx-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-6 peer-focus:text-slate-800"
              >
                Password
              </label>
              <div
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEye size={18} /> : <FiEyeOff size={18} />}
              </div>
            </div>
            {/* Forgot Password Link */}
            <div className="text-right text-sm">
              <a
                href="#"
                className="text-red-600 hover:text-red-800 hover:underline transition duration-150"
              >
                Forgot Password?
              </a>
            </div>
            {/* Login Button */}
            <button
              className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 rounded-md text-white"
              type="submit"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
