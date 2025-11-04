import { AnimatePresence,motion } from 'framer-motion';
import { Home, Menu, Users, X } from 'lucide-react';
import React, { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'

const SettingsLayout = () => {
   const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    
    {
      label: "Customer List",
      to: "/portal/customer-master/customer-list",
      icon: <Users size={18} />,
    },
    {
      label: "Customer Creation",
      to: "/portal/customer-master/customer-creation",
      icon: <Home size={18} />,
      
    },
  ];

  return (
    <div className="w-full h-[calc(100vh-63px)] bg-[var(--secondary)] flex flex-col">
      {/* Header */}
      <div className="mb-2 flex flex-col sm:flex-row sm:items-end justify-between px-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
          Settings
          </h1>
          <p className="text-sm text-[var(--foreground)]">
            Control and customize your application settings.
          </p>
        </div>

        {/* Mobile menu button */}
        <button
          className="sm:hidden flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-black mt-2"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          Menu
        </button>
      </div>
      
      {/* Main content grid */}
      <div className="flex-1 flex flex-col sm:grid sm:grid-cols-5 gap-4 px-2 pb-1 overflow-hidden">
        {/* Sidebar (desktop) */}
        <div className="hidden sm:block col-span-1 bg-[var(--background)]/95 border border-[var(--border)] rounded-xl p-3 overflow-auto">
          <nav className="flex flex-col gap-2">
            {menuItems.map((item, i) => (
              <motion.div
                key={item.to}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 80 }}
              >
                <Link
                  to={item.to}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    location.pathname === item.to
                      ? "bg-[var(--background)] text-[var(--foreground)]"
                      : "text-[var(--foreground)] hover:bg-[var(--background)]"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              </motion.div>
            ))}
          </nav>
        </div>

        {/* Sidebar (mobile) */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="sm:hidden fixed inset-y-0 left-0 w-64 bg-white border-r border-[var(--border)] z-50 p-4"
            >
              <nav className="flex flex-col gap-2">
                {menuItems.map((item, i) => (
                  <motion.div
                    key={item.to}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link
                      to={item.to}
                      onClick={() => setSidebarOpen(false)} // auto-close after click
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        location.pathname === item.to
                          ? "bg-[var(--accent)] text-[var(--foreground)]"
                          : "text-[var(--foreground)] hover:bg-[var(--accent)]"
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Outlet content */}
        <div className="flex-1 sm:col-span-4 bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-auto custom-scrollbar">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout
