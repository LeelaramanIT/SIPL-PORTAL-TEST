import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FaTruck, FaIndustry, FaGlobe, FaChartLine, FaCog, FaShieldAlt, FaUsers, FaFileInvoice, FaWarehouse, FaClipboardList, FaChartBar, FaCogs } from "react-icons/fa";
import { BsTruck, BsGearWideConnected, BsPersonBadge, BsCalendarCheck } from "react-icons/bs";
import { MdEngineering, MdLocalShipping, MdDashboard, MdInventory, MdAssessment } from "react-icons/md";
import InvoiceBill from "../TTS/International/Invoice/Export Invoice/InvoiceBill";

const Home = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in");
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll(".animate-on-scroll");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const quickActions = [
    {
      icon: <FaFileInvoice className="text-4xl" />,
      title: "Invoice Management",
      description: "Create and manage export invoices",
      link: "TTS/International/Invoice/ExportInvoice"
    },
    {
      icon: <FaUsers className="text-4xl" />,
      title: "User Management",
      description: "Manage employee accounts and permissions",
      link: "/Masters/UserMaster"
    },
    {
      icon: <FaWarehouse className="text-4xl" />,
      title: "Inventory Tracking",
      description: "Monitor stock levels and warehouse operations",
      link: "/inventory"
    },
    {
      icon: <FaChartBar className="text-4xl" />,
      title: "Reports & Analytics",
      description: "View production and sales reports",
      link: "/reports"
    },
    {
      icon: <FaClipboardList className="text-4xl" />,
      title: "Production Orders",
      description: "Track manufacturing and production status",
      link: "/production"
    },
    {
      icon: <FaCogs className="text-4xl" />,
      title: "System Settings",
      description: "Configure application settings and preferences",
      link: "/settings"
    }
  ];

  const recentActivities = [
    { action: "Invoice #INV-2024-001 created", time: "2 hours ago", user: "John Doe" },
    { action: "Production order #PO-2024-156 completed", time: "4 hours ago", user: "Sarah Smith" },
    { action: "New user account created", time: "6 hours ago", user: "Admin" },
    { action: "Inventory updated - Tyre Model T-456", time: "8 hours ago", user: "Mike Johnson" },
    { action: "Export shipment dispatched", time: "1 day ago", user: "Lisa Chen" }
  ];

  const systemStats = [
    { number: "156", label: "Active Invoices" },
    { number: "89", label: "Pending Orders" },
    { number: "1,234", label: "Total Products" },
    { number: "45", label: "Online Users" }
  ];

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Welcome Section */}
      <motion.div 
        className="relative overflow-hidden bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] text-white py-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full"
            animate={{ 
              x: [0, 100, 0],
              y: [0, 50, 0],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <motion.div
            className="absolute top-20 right-20 w-32 h-32 bg-white/5 rounded-full"
            animate={{ 
              x: [0, -80, 0],
              y: [0, -40, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 15,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.h1 
              className="text-4xl md:text-6xl font-bold mb-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Welcome to TVS Portal
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl mb-6 opacity-90"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Internal Management System
            </motion.p>
            <motion.p
              className="text-lg opacity-80"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              Access your tools, manage operations, and stay connected with the team
            </motion.p>
          </motion.div>
        </div>
      </motion.div>

      {/* System Stats */}
      <motion.div 
        className="py-12 bg-[var(--color-secondary)]"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {systemStats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center bg-[var(--color-background)] p-4 rounded-lg border border-[var(--color-secondary)]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <motion.div
                  className="text-3xl md:text-4xl font-bold text-[var(--color-primary)] mb-2"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 + 0.3 }}
                  viewport={{ once: true }}
                >
                  {stat.number}
                </motion.div>
                <div className="text-[var(--color-text)] font-medium text-sm">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div 
        className="py-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-[var(--color-primary)] mb-4">
              Quick Actions
            </h2>
            <p className="text-lg text-[var(--color-text)] opacity-75 max-w-3xl mx-auto">
              Access frequently used tools and features to streamline your daily operations.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {quickActions.map((action, index) => (
              <motion.div
                key={index}
                className="bg-[var(--color-background)] p-6 rounded-xl border border-[var(--color-secondary)] hover:shadow-lg transition-all duration-300 group cursor-pointer"
                variants={fadeInUp}
                whileHover={{ y: -5, scale: 1.02 }}
                onClick={() => window.location.href = action.link}
              >
                <motion.div
                  className="text-[var(--color-primary)] mb-4 group-hover:scale-110 transition-transform duration-300"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  {action.icon}
                </motion.div>
                <h3 className="text-xl font-semibold text-[var(--color-primary)] mb-3">
                  {action.title}
                </h3>
                <p className="text-[var(--color-text)] opacity-75 text-sm">
                  {action.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Recent Activities & Invoice Management */}
      <motion.div 
        className="py-16 bg-[var(--color-secondary)]"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Activities */}
            <motion.div
              className="bg-[var(--color-background)] p-6 rounded-xl border border-[var(--color-secondary)]"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold text-[var(--color-primary)] mb-6">
                Recent Activities
              </h3>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center justify-between p-3 bg-[var(--color-secondary)] rounded-lg"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="flex-1">
                      <p className="text-[var(--color-text)] font-medium text-sm">
                        {activity.action}
                      </p>
                      <p className="text-[var(--color-text)] opacity-60 text-xs">
                        by {activity.user}
                      </p>
                    </div>
                    <span className="text-[var(--color-text)] opacity-50 text-xs">
                      {activity.time}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Invoice Management */}
            <motion.div
              className="bg-[var(--color-background)] p-6 rounded-xl border border-[var(--color-secondary)]"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold text-[var(--color-primary)] mb-6">
                Invoice Management
              </h3>
              <p className="text-[var(--color-text)] opacity-75 mb-4">
                Manage export invoices and track shipments.
              </p>
              <div className="bg-[var(--color-secondary)] p-4 rounded-lg">
                <InvoiceBill />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Quick Tips */}
      <motion.div 
        className="py-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] text-white p-8 rounded-xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold mb-4">
              Need Help?
            </h3>
            <p className="text-lg opacity-90 mb-6">
              For technical support or system-related questions, contact the IT department or check the employee handbook.
            </p>
            <div className="flex flex-wrap gap-4">
              <motion.button
                className="bg-white text-[var(--color-primary)] px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Contact IT Support
              </motion.button>
              <motion.button
                className="border-2 border-white text-white px-6 py-2 rounded-lg font-semibold hover:bg-white hover:text-[var(--color-primary)] transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View Documentation
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.div>
  </div>
  );
};

export default Home;