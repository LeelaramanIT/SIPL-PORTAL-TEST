import React from "react";
import Calendar from "../Calendar/Calendar";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  // Example employee data
  const employee = {
    name: "John Doe",
    department: "Engineering",
    email: "john.doe@example.com",
    phone: "+1 234 567 890",
    picture: "https://randomuser.me/api/portraits/men/32.jpg", // Placeholder image
  };

  // Example data for charts
  const salesData = [
    { month: "Jan", sales: 4000, target: 2400 },
    { month: "Feb", sales: 3000, target: 2210 },
    { month: "Mar", sales: 2000, target: 2290 },
    { month: "Apr", sales: 2780, target: 2000 },
    { month: "May", sales: 1890, target: 2181 },
    { month: "Jun", sales: 2390, target: 2500 },
    { month: "Jul", sales: 3490, target: 2100 },
  ];

  // Example pending tasks
  const tasks = [
    { id: 1, title: "Complete project report", due: "Today" },
    { id: 2, title: "Team meeting", due: "Tomorrow" },
    { id: 3, title: "Fix login bug", due: "This Week" },
    { id: 4, title: "Update documentation", due: "Next Week" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-3 sm:p-6 bg-gray-50 min-h-screen">
      {/* Employee Info */}
      <div className="col-span-1 sm:col-span-2 lg:col-span-2 bg-white rounded-lg shadow p-3 sm:p-4 flex flex-col sm:flex-row items-center">
        <img
          src={employee.picture}
          alt="Employee"
          className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-full shadow mb-3 sm:mb-0"
        />
        <div className="sm:ml-4 lg:ml-6 text-center sm:text-left">
          <div className="font-semibold text-lg sm:text-xl md:text-2xl lg:text-3xl">{employee.name}</div>
          <div className="text-gray-500 mb-2 text-sm sm:text-base">{employee.department}</div>
          <div className="text-xs sm:text-sm md:text-base text-gray-700 mb-1">
            Email: {employee.email}
          </div>
          <div className="text-xs sm:text-sm md:text-base text-gray-700">
            Phone: {employee.phone}
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white w-full h-full rounded-lg shadow p-1">
        <Calendar variant="mini" />
      </div>

      {/* Line Chart */}
      <div className="bg-white rounded-lg shadow p-2 sm:p-4 flex flex-col items-center">
        <h2 className="text-sm sm:text-base lg:text-lg font-semibold mb-2">Sales Performance</h2>
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" fontSize={10} />
            <YAxis fontSize={10} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} />
            <Line type="monotone" dataKey="target" stroke="#82ca9d" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-lg shadow p-2 sm:p-4 flex flex-col items-center">
        <h2 className="text-sm sm:text-base lg:text-lg font-semibold mb-2">Monthly Sales</h2>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" fontSize={10} />
            <YAxis fontSize={10} />
            <Tooltip />
            <Legend />
            <Bar dataKey="sales" fill="#8884d8" />
            <Bar dataKey="target" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pending Tasks */}
      <div className="col-span-1 sm:col-span-2 lg:col-span-2 bg-white rounded-lg shadow p-3 sm:p-4 flex flex-col">
        <h2 className="text-sm sm:text-base lg:text-lg font-semibold mb-3 sm:mb-4">Pending Tasks</h2>
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="p-2 border rounded-lg bg-gray-100 hover:bg-gray-200 cursor-pointer"
            >
              <div className="font-medium text-xs sm:text-sm">{task.title}</div>
              <div className="text-xs text-gray-500">Due: {task.due}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
