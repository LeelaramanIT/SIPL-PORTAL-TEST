import React from "react";

const Dashboard = () => {
  // Example employee data
  const employee = {
    name: "John Doe",
    department: "Engineering",
    email: "john.doe@example.com",
    phone: "+1 234 567 890",
    picture: "https://randomuser.me/api/portraits/men/32.jpg", // Placeholder image
  };

  return (
    <div className="grid grid-cols-4 grid-rows-3 gap-4 p-6 bg-gray-50 min-h-full">
      <div className="col-span-2 row-span-1 col-start-1 bg-white rounded-lg shadow p-4 flex items-center justify-evenly
       text-xl font-bold">
        <div className="w-1/2 flex justify-center items-center">
        <img src={employee.picture} alt="Employee" className="w-40 h-40 rounded-full shadow" />
        </div>
        <div className="w-1/2 flex flex-col justify-start items-start">
        <div className="font-semibold mb-1 text-3xl">{employee.name}</div>
        <div className="text-gray-500 mb-2">{employee.department}</div>
        <div className="text-base font-normal text-gray-700 mb-1">Email: {employee.email}</div>
        <div className="text-base font-normal text-gray-700">Phone: {employee.phone}</div>
        </div>
      </div>
      <div className="row-span-2 col-start-3 bg-white rounded-lg shadow p-4 flex items-center justify-center text-xl font-bold">2</div>
      <div className="row-span-2 col-start-4 bg-white rounded-lg shadow p-4 flex items-center justify-center text-xl font-bold">3</div>
      <div className="col-start-1 row-start-2 bg-white rounded-lg shadow p-4 flex items-center justify-center text-xl font-bold">4</div>
      <div className="col-start-2 row-start-2 bg-white rounded-lg shadow p-4 flex items-center justify-center text-xl font-bold">5</div>
      <div className="col-span-2 row-span-1 col-start-3 row-start-3 bg-white rounded-lg shadow p-4 flex items-center justify-center text-xl font-bold">6</div>
      <div className="col-start-1 row-start-3 bg-white rounded-lg shadow p-4 flex items-center justify-center text-xl font-bold">7</div>
      <div className="col-start-2 row-start-3 bg-white rounded-lg shadow p-4 flex items-center justify-center text-xl font-bold">8</div>
    </div>
  );
};

export default Dashboard;
