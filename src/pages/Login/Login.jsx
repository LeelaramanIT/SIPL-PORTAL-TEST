import { useEffect, useRef, useState } from "react";
import assets from "../../assets/assets";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { NavLink,useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useDispatch, useSelector } from "react-redux";
import { userLogin } from "../../Redux/Slices/AuthSlice";
import toast from "react-hot-toast";
import LogginButton from '../../components/LoadingButton'
const videoOption = [assets.Mountain, assets.SKY];
const randomIndex = Math.floor(Math.random() * videoOption.length);

const Login = () => {
  const username = useRef();
  const password = useRef();
  const [showPassword, setShowPassword] = useState(false);
  const [video, setVideo] = useState(null);
  const navigate = useNavigate()
  const dispatch = useDispatch();
  const {loading,error,loggedIn} = useSelector((state)=>state.auth)

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(userLogin({username:username.current.value,password:password.current.value}))
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
  if (loggedIn) {
    toast.success("Login successful!");
    navigate("/");
  }
}, [loggedIn, navigate]);

useEffect(() => {
  if (error) {
    toast.error(error); // ✅ Show login error
  }
}, [error]);



  const div1 = useRef([]);
  const div2 = useRef([]);
  const div3 = useRef([]);
  const div4 = useRef([]);
  const div5 = useRef([]);
  const div6 = useRef([]);
  const div7 = useRef([]);

  useEffect(() => {
    gsap.fromTo(
      [
        div1.current,
        div2.current,
        div3.current,
        div4.current,
        div5.current,
        div6.current,
        div7.current,
      ],
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.3,
        stagger: 0.1,
        ease: "power2.out",
      }
    );

    setVideo(videoOption[randomIndex]);
  }, []);

  return (
    <div
      className="w-full min-h-screen flex justify-center items-center relative overflow-hidden bg-black/5"
      style={{
        // backgroundImage: `url(${assets.SKY1})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <img
        ref={div1}
        src={assets.TVSLOGO}
        className="absolute z-10 top-5 left-5 w-[15rem]"
      />
      {/* Background Video */}
      {video && (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
        >
          <source src={video} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}

      {/* Login Form Container */}
      <div
        ref={div2}
        className="relative z-10 w-full max-w-md p-6 sm:p-8 rounded-2xl shadow-2xl backdrop-blur-md bg-white/5 border border-white/30"
      >
        <h1
          ref={div3}
          className={`text-2xl sm:text-[1.8rem] font-bold text-center font-heading ${
            randomIndex === 1 ? "text-slate-900" : "text-white"
          } mb-10 select-none`}
        >
          Sundaram Industries Pvt Ltd
        </h1>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Username Field */}
          <div ref={div4} className="relative">
            <input
              type="text"
              id="username"
              ref={username}
              placeholder=" "
              required
              className={`block px-2.5 pb-2.5 pt-4 w-full text-sm ${
                randomIndex === 1
                  ? "text-slate-900 border-gray-800/40"
                  : "text-white focus:border-gray-50 border-gray-100"
              } bg-transparent rounded-lg border  appearance-none focus:outline-none focus:ring-0 peer`}
            />
            <label
              htmlFor="username"
              className={`absolute text-sm duration-300 transform -translate-y-4 scale-75 top-2 z-10 px-2
  ${randomIndex === 1 ? "text-slate-900" : "text-white"}
  peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 
  peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-6.5 
  peer-valid:top-2 peer-valid:scale-75 peer-valid:-translate-y-6.5`}
            >
              Username
            </label>
          </div>

          {/* Password Field */}
          <div ref={div5} className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              ref={password}
              required
              placeholder=" "
              className={`block px-2.5 pb-2.5 pt-4 w-full text-sm ${
                randomIndex === 1
                  ? "text-slate-900 border-gray-800/40"
                  : "text-white focus:border-gray-50 border-gray-100"
              } bg-transparent rounded-lg border  appearance-none focus:outline-none focus:ring-0 peer`}
            />
            <label
              htmlFor="password"
              className={`absolute text-sm duration-300 transform -translate-y-4 scale-75 top-2 z-10 px-2
  ${randomIndex === 1 ? "text-slate-900" : "text-white"}
  peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 
  peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-6.5 
  peer-valid:top-2 peer-valid:scale-75 peer-valid:-translate-y-6.5`}
            >
              Password
            </label>
            <div
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer ${
            randomIndex === 1 ? "text-slate-900" : "text-white"
          } text-slate-900/70`}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEye size={18} /> : <FiEyeOff size={18} />}
            </div>
          </div>

          {/* Forgot Password */}
          <div ref={div6} className="text-sm flex justify-between ">
            <NavLink
              to={""}
              className={`${randomIndex === 1 ? 'text-gray-950':'text-gray-50' } hover:text-gray-700 hover:underline transition duration-150 select-none`}
            >
              Create Account?
            </NavLink>
            <NavLink
              to={""}
              className="text-red-500 hover:text-red-600 hover:underline transition duration-150 select-none"
            >
              Forgot Password?
            </NavLink>
          </div>

          {/* Login Button */}
          {loading ? <LogginButton/>:  <button
            ref={div7}
            type="submit"
            className="w-full flex justify-center items-center select-none py-2 px-4 bg-slate-900 hover:bg-slate-800 rounded-md text-white"
          >
          Login
          </button> }
        </form>
      </div>
    </div>
  );
};

export default Login;
