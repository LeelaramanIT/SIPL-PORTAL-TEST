import React, { useEffect, useRef, useState } from "react";
import assets from "../../assets/assets";
import { FiEye, FiEyeOff } from "react-icons/fi";

const Login = () => {
  const vantaRef = useRef(null);
  const [vantaEffect, setVantaEffect] = useState(null);

  useEffect(() => {
    // Check if the Vanta and Three.js libraries are loaded
    const loadVanta = async () => {
      const VANTA = await import("../../assets/dist/vanta.clouds.min.js"); // Adjust path if needed
      if (!vantaEffect && vantaRef.current) {
        setVantaEffect(
          VANTA.default({
            el: vantaRef.current,
            THREE: THREE,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.0,
            minWidth: 200.0,
          })
        );
      }
    };
    loadVanta();

    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted");
  };

  const [showPassword, setShowPassword] = useState(false);
  return (
    <div
      className="w-full min-h-screen flex flex-col md:flex-row"
      ref={vantaRef}
    >
      {/* Left Side - Shaped Design */}
      <div
        className="w-[95%] md:w-[50%] h-72 md:h-[97vh] relative flex justify-center items-center rounded-3xl overflow-hidden m-2"
        style={{
          backgroundImage: `url(${assets.LogoDevition})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          // clipPath: "polygon(0 0, 100% 0, 85% 100%, 0% 100%)",
        }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-xs"></div>

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
        <div className="bg-[#f2ecf284] p-6 sm:p-8 rounded-lg shadow-2xl w-full max-w-md">
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-blue-500 mb-4">
          Sundaram Industries Pvt Ltd
          </h1>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Username Field */}
            <div className="relative">
              <input
                type="text"
                id="username"
                className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                placeholder=" "
              />
              <label
                htmlFor="username"
                className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 px-2 mx-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-blue-600"
              >
                Username
              </label>
            </div>

            {/* Password Field */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                placeholder=" "
              />
              <label
                htmlFor="password"
                className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10  px-2 mx-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-blue-600"
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
              className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 rounded-md text-white"
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
