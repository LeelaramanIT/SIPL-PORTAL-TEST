import React from "react";
import ThemeSwitcher from "../../components/ThemeSwitcher";
import DarkModeToggle from "../../components/DarkModeToggle/DarkModeToggle";
import { useDispatch, useSelector } from "react-redux";
import { setChatVisible } from "../../Redux/Slices/GlobalSlice";

const Settings = () => {
  const { isChatOpen } = useSelector((state) => state.global);
  const dispatch = useDispatch();

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100 transition-colors">
      <h1 className="text-2xl font-bold text-[var(--color-primary)] dark:text-indigo-400 mb-6">
        Settings
      </h1>

      <div className="space-y-6">
        {/* Theme Settings Section */}
        <div className="bg-[var(--color-background)] dark:bg-gray-800 p-6 rounded-lg border border-[var(--color-secondary)] dark:border-gray-700 shadow-md">
          <h2 className="text-lg font-semibold text-[var(--color-primary)] dark:text-indigo-400 mb-4">
            Appearance
          </h2>

          <div className="space-y-6">
            {/* Color Theme */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] dark:text-gray-300 mb-2">
                Color Theme
              </label>
              <div className="flex items-center gap-4">
                <ThemeSwitcher variant="navbar" />
                <span className="text-sm text-[var(--color-text)] dark:text-gray-400 opacity-75">
                  Choose your preferred color scheme
                </span>
              </div>
            </div>

            {/* Dark Mode Toggle */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] dark:text-gray-300 mb-2">
                Dark Mode
              </label>
              <div className="flex items-center gap-4">
                <DarkModeToggle />
                <span className="text-sm text-[var(--color-text)] dark:text-gray-400 opacity-75">
                  Toggle between light and dark mode
                </span>
              </div>
            </div>

            {/* Chat Toggle */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] dark:text-gray-300 mb-2">
                Support Chat
              </label>
              <div className="flex items-center gap-4">
                <div className="relative inline-block w-11 h-6">
                  <input
                    onChange={() => dispatch(setChatVisible())}
                    id="switch-component-1"
                    type="checkbox"
                    checked={isChatOpen}
                    className="peer appearance-none w-11 h-6 bg-gray-300 dark:bg-gray-600 rounded-full checked:bg-indigo-600 cursor-pointer transition-colors duration-300"
                  />
                  <label
                    htmlFor="switch-component-1"
                    className="absolute top-0 left-0 w-6 h-6 bg-white dark:bg-gray-200 rounded-full border border-gray-400 dark:border-gray-500 shadow-sm transition-transform duration-300 peer-checked:translate-x-5 peer-checked:border-indigo-600 cursor-pointer"
                  ></label>
                </div>
                <span className="text-sm text-[var(--color-text)] dark:text-gray-400 opacity-75">
                  Enable ChatBox
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Account Section */}
        <div className="bg-[var(--color-background)] dark:bg-gray-800 p-6 rounded-lg border border-[var(--color-secondary)] dark:border-gray-700 shadow-md">
          <h2 className="text-lg font-semibold text-[var(--color-primary)] dark:text-indigo-400 mb-4">
            Account
          </h2>
          <p className="text-[var(--color-text)] dark:text-gray-400 opacity-75">
            Account settings will be available here
          </p>
        </div>

        {/* Notifications Section */}
        <div className="bg-[var(--color-background)] dark:bg-gray-800 p-6 rounded-lg border border-[var(--color-secondary)] dark:border-gray-700 shadow-md">
          <h2 className="text-lg font-semibold text-[var(--color-primary)] dark:text-indigo-400 mb-4">
            Notifications
          </h2>
          <p className="text-[var(--color-text)] dark:text-gray-400 opacity-75">
            Notification preferences will be available here
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
