import React from "react";
import { motion } from "framer-motion";
import Calendar from "../Calendar/Calendar";
import { 
  User, Mail, Phone, Briefcase, 
  CheckCircle2, Clock, TrendingUp, BarChart3 
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useSelector } from "react-redux";

const Dashboard = () => {
  const employee = {
    name: "John Doe",
    department: "Engineering",
    email: "john.doe@example.com",
    phone: "+1 234 567 890",
    picture: "https://randomuser.me/api/portraits/men/32.jpg",
  };

  const {username} = useSelector(state => state.auth)
  const salesData = [
    { month: "Jan", sales: 4000, target: 2400 },
    { month: "Feb", sales: 3000, target: 2210 },
    { month: "Mar", sales: 2000, target: 2290 },
    { month: "Apr", sales: 2780, target: 2000 },
    { month: "May", sales: 1890, target: 2181 },
    { month: "Jun", sales: 2390, target: 2500 },
    { month: "Jul", sales: 3490, target: 2100 },
  ];

  const tasks = [
    { id: 1, title: "Complete project report", due: "Today", status: "urgent" },
    { id: 2, title: "Team meeting", due: "Tomorrow", status: "planned" },
    { id: 3, title: "Fix login bug", due: "This Week", status: "urgent" },
    { id: 4, title: "Update documentation", due: "Next Week", status: "low" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="p-4 bg-slate-50 dark:bg-slate-900 h-[91vh] custom-scrollbar grid grid-cols-1 md:grid-cols-4 gap-4"
    >
      {/* 1. Profile Bento Card */}
      <motion.div variants={itemVariants} className="md:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex items-center shadow-sm">
        <div className="relative">
          <img
            src={employee.picture}
            alt="Employee"
            className="w-24 h-24 rounded-2xl object-cover ring-4 ring-blue-50 dark:ring-blue-300"
          />
          <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-4 border-white"></div>
        </div>
        <div className="ml-6 space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">{(username).toUpperCase()}</h1>
            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-500 text-blue-600 dark:text-white text-[10px] font-bold uppercase rounded-full">Pro</span>
          </div>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
            <Briefcase className="w-3 h-3" /> {employee.department}
          </p>
          <div className="pt-2 flex flex-col gap-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 italic">
              <Mail className="w-3 h-3" /> {employee.email}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 italic">
              <Phone className="w-3 h-3" /> {employee.phone}
            </span>
          </div>
        </div>
      </motion.div>

      {/* 2. Mini Calendar Card */}
      <motion.div variants={itemVariants} className="md:col-span-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-2 shadow-sm overflow-hidden">
        <div className="bg-slate-50 dark:bg-slate-700 rounded-xl h-full">
           <Calendar variant="mini" />
        </div>
      </motion.div>

      {/* 3. Task Summary Quick Stat */}
      <motion.div variants={itemVariants} className="md:col-span-1 bg-slate-900 dark:bg-slate-700 rounded-2xl p-6 text-white shadow-lg flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="p-2 bg-white/10 rounded-lg"><CheckCircle2 className="w-5 h-5" /></div>
          <span className="text-[10px] font-bold bg-white/20 px-2 py-1 rounded">WEEKLY TARGET</span>
        </div>
        <div>
          <h3 className="text-3xl font-bold">84%</h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-300 uppercase font-bold tracking-widest mt-1">Tasks Completed</p>
        </div>
      </motion.div>

      {/* 4. Sales Chart Area */}
      <motion.div variants={itemVariants} className="md:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xs font-bold text-slate-400 dark:text-slate-300 uppercase tracking-widest flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500" /> Revenue vs Target
          </h2>
          <select className="text-[10px] font-bold border-none bg-slate-100 dark:bg-slate-700 rounded-md px-2 py-1 outline-none">
            <option>Last 7 Months</option>
          </select>
        </div>
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px' }} 
              />
              <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="target" stroke="#e2e8f0" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* 5. Distribution Chart */}
      <motion.div variants={itemVariants} className="md:col-span-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
        <h2 className="text-xs font-bold text-slate-400 dark:text-slate-300 uppercase tracking-widest mb-6 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-indigo-500" /> Distribution
        </h2>
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesData}>
              <Bar dataKey="sales" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={12} />
              <XAxis dataKey="month" fontSize={10} axisLine={false} tickLine={false} hide />
              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', fontSize: '10px'}} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* 6. Pending Tasks List */}
      <motion.div variants={itemVariants} className="md:col-span-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xs font-bold text-slate-400 dark:text-slate-300 uppercase tracking-widest">To-Do List</h2>
          <span className="text-[10px] font-bold text-blue-500 bg-blue-50 dark:bg-blue-600 dark:text-white px-2 py-0.5 rounded cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-700">View All</span>
        </div>
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="group p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700 border border-transparent hover:border-slate-200 hover:bg-white dark:hover:bg-slate-600 transition-all cursor-pointer">
              <div className="flex items-start justify-between">
                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 leading-tight group-hover:text-blue-600">{task.title}</p>
                {task.status === 'urgent' && <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1"></div>}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-tighter">
                <Clock className="w-3 h-3" /> Due {task.due}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

    </motion.div>
  );
};

export default Dashboard;
