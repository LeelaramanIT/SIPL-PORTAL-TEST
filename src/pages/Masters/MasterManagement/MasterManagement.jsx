import React, { useState, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  Save,
  Search,
  AlertCircle,
  CheckCircle,
  X,
} from 'lucide-react';

// ==================== REUSABLE COMPONENTS ====================

// FormInput Component
const FormInput = ({ label, name, value, onChange, placeholder, error, required }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-3.5 py-2.5 border rounded-lg text-sm font-normal transition-colors ${
        error
          ? 'border-red-300 bg-red-50 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100'
          : 'border-gray-200 bg-white hover:border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
      }`}
    />
    {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
  </div>
);

// FormSelect Component
const FormSelect = ({ label, name, value, onChange, options, error, required }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full px-3.5 py-2.5 border rounded-lg text-sm font-normal transition-colors cursor-pointer ${
        error
          ? 'border-red-300 bg-red-50 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100'
          : 'border-gray-200 bg-white hover:border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
      }`}
    >
      <option value="">Select {label}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
  </div>
);

// FormTextarea Component
const FormTextarea = ({ label, name, value, onChange, placeholder, error, required, rows = 3 }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className={`w-full px-3.5 py-2.5 border rounded-lg text-sm font-normal transition-colors resize-none ${
        error
          ? 'border-red-300 bg-red-50 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100'
          : 'border-gray-200 bg-white hover:border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
      }`}
    />
    {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
  </div>
);

// Delete Confirmation Modal
const DeleteConfirmationModal = ({ isOpen, onConfirm, onCancel, itemName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 transform transition-all">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900">Delete Record</h3>
            <p className="text-sm text-gray-600 mt-2">
              Are you sure you want to delete <strong>{itemName}</strong>? This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex gap-3 mt-6 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Data Table Component
const DataTable = ({ data, columns, onEdit, onDelete, onToggleStatus, searchTerm, moduleId }) => {
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null });

  const filteredData = data.filter((item) =>
    Object.values(item).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Search className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 text-sm font-medium">No records found</p>
        <p className="text-gray-400 text-xs mt-1">Create your first record to get started</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-3 text-left font-semibold text-gray-700 text-xs uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
              <th className="px-4 py-3 text-center font-semibold text-gray-700 text-xs uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700 text-xs uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr
                key={item.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 text-gray-900 whitespace-nowrap">
                    {typeof item[column.key] === 'string' &&
                    item[column.key].length > 30
                      ? `${item[column.key].substring(0, 30)}...`
                      : item[column.key]}
                  </td>
                ))}
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => onToggleStatus(item.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                      item.status === 'Active'
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    {item.status}
                  </button>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onEdit(item)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setDeleteModal({
                          isOpen: true,
                          item: item,
                          moduleId: moduleId,
                        })
                      }
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        itemName={
          deleteModal.item?.name ||
          deleteModal.item?.userName ||
          deleteModal.item?.companyName ||
          deleteModal.item?.bankName ||
          deleteModal.item?.departmentName ||
          deleteModal.item?.approvalType ||
          'Record'
        }
        onConfirm={() => {
          onDelete(deleteModal.item.id, deleteModal.moduleId);
          setDeleteModal({ isOpen: false, item: null });
        }}
        onCancel={() => setDeleteModal({ isOpen: false, item: null })}
      />
    </>
  );
};

// Master Section Card Component
const MasterSection = ({
  title,
  icon: Icon,
  isOpen,
  onToggle,
  children,
  data,
  isLoading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition-colors border-b border-gray-200"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Icon className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          {data.length > 0 && (
            <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
              {data.length}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-600 transition-transform" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-600 transition-transform" />
        )}
      </button>

      {/* Content */}
      {isOpen && (
        <div className="border-t border-gray-200">
          {/* Form Section */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">{children}</div>

          {/* Data Table Section */}
          {data.length > 0 && (
            <div className="p-6">
              <div className="mb-4 flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-2.5 text-sm bg-transparent outline-none placeholder-gray-400"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto rounded-lg border border-gray-200">
                {children.props?.table && (
                  <DataTable
                    data={data}
                    columns={children.props.columns}
                    onEdit={children.props.onEdit}
                    onDelete={children.props.onDelete}
                    onToggleStatus={children.props.onToggleStatus}
                    searchTerm={searchTerm}
                    moduleId={children.props.moduleId}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ==================== MAIN COMPONENT ====================

const MasterManagement = () => {
  const [globalSearch, setGlobalSearch] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    user: true,
    export: false,
    bank: false,
    department: false,
    approval: false,
  });

  // User Master State
  const [userFormData, setUserFormData] = useState({
    userName: '',
    employeeId: '',
    email: '',
    role: '',
  });
  const [userErrors, setUserErrors] = useState({});
  const [userdata, setUserdata] = useState([]);
  const [userLoading, setUserLoading] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);

  // Export Address Master State
  const [exportFormData, setExportFormData] = useState({
    companyName: '',
    gstNumber: '',
    address: '',
    country: '',
  });
  const [exportErrors, setExportErrors] = useState({});
  const [exportData, setExportData] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [editingExportId, setEditingExportId] = useState(null);

  // Bank Details State
  const [bankFormData, setBankFormData] = useState({
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    branch: '',
  });
  const [bankErrors, setBankErrors] = useState({});
  const [bankData, setBankData] = useState([]);
  const [bankLoading, setBankLoading] = useState(false);
  const [editingBankId, setEditingBankId] = useState(null);

  // Department Master State
  const [deptFormData, setDeptFormData] = useState({
    departmentName: '',
    departmentCode: '',
    managerName: '',
  });
  const [deptErrors, setDeptErrors] = useState({});
  const [deptData, setDeptData] = useState([]);
  const [deptLoading, setDeptLoading] = useState(false);
  const [editingDeptId, setEditingDeptId] = useState(null);

  // Approval Configuration State
  const [approvalFormData, setApprovalFormData] = useState({
    approvalType: '',
    level: '',
    assignedUser: '',
    status: 'Active',
  });
  const [approvalErrors, setApprovalErrors] = useState({});
  const [approvalData, setApprovalData] = useState([]);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [editingApprovalId, setEditingApprovalId] = useState(null);

  // ==================== VALIDATION ====================

  const validateUserForm = () => {
    const errors = {};
    if (!userFormData.userName.trim()) errors.userName = 'User name is required';
    if (!userFormData.employeeId.trim()) errors.employeeId = 'Employee ID is required';
    if (!userFormData.email.trim()) errors.email = 'Email is required';
    if (userFormData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userFormData.email)) {
      errors.email = 'Invalid email format';
    }
    if (!userFormData.role) errors.role = 'Role is required';
    return errors;
  };

  const validateExportForm = () => {
    const errors = {};
    if (!exportFormData.companyName.trim())
      errors.companyName = 'Company name is required';
    if (!exportFormData.gstNumber.trim()) errors.gstNumber = 'GST number is required';
    if (!exportFormData.address.trim()) errors.address = 'Address is required';
    if (!exportFormData.country) errors.country = 'Country is required';
    return errors;
  };

  const validateBankForm = () => {
    const errors = {};
    if (!bankFormData.bankName.trim()) errors.bankName = 'Bank name is required';
    if (!bankFormData.accountNumber.trim())
      errors.accountNumber = 'Account number is required';
    if (!bankFormData.ifscCode.trim()) errors.ifscCode = 'IFSC code is required';
    if (!bankFormData.branch.trim()) errors.branch = 'Branch is required';
    return errors;
  };

  const validateDeptForm = () => {
    const errors = {};
    if (!deptFormData.departmentName.trim())
      errors.departmentName = 'Department name is required';
    if (!deptFormData.departmentCode.trim())
      errors.departmentCode = 'Department code is required';
    if (!deptFormData.managerName.trim()) errors.managerName = 'Manager name is required';
    return errors;
  };

  const validateApprovalForm = () => {
    const errors = {};
    if (!approvalFormData.approvalType) errors.approvalType = 'Approval type is required';
    if (!approvalFormData.level) errors.level = 'Level is required';
    if (!approvalFormData.assignedUser.trim())
      errors.assignedUser = 'Assigned user is required';
    return errors;
  };

  // ==================== SAVE HANDLERS ====================

  const handleSaveUser = async () => {
    const errors = validateUserForm();
    if (Object.keys(errors).length > 0) {
      setUserErrors(errors);
      toast.error('Please fix all errors before saving');
      return;
    }

    setUserLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (editingUserId) {
        setUserdata(userdata.map(item =>
          item.id === editingUserId
            ? { ...userFormData, id: editingUserId, status: item.status }
            : item
        ));
        toast.success('User updated successfully');
        setEditingUserId(null);
      } else {
        const newRecord = {
          ...userFormData,
          id: Date.now(),
          status: 'Active',
        };
        setUserdata([...userdata, newRecord]);
        toast.success('User created successfully');
      }

      setUserFormData({ userName: '', employeeId: '', email: '', role: '' });
      setUserErrors({});
    } catch (error) {
      toast.error('Error saving user');
    } finally {
      setUserLoading(false);
    }
  };

  const handleSaveExport = async () => {
    const errors = validateExportForm();
    if (Object.keys(errors).length > 0) {
      setExportErrors(errors);
      toast.error('Please fix all errors before saving');
      return;
    }

    setExportLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (editingExportId) {
        setExportData(exportData.map(item =>
          item.id === editingExportId
            ? { ...exportFormData, id: editingExportId, status: item.status }
            : item
        ));
        toast.success('Export address updated successfully');
        setEditingExportId(null);
      } else {
        const newRecord = {
          ...exportFormData,
          id: Date.now(),
          status: 'Active',
        };
        setExportData([...exportData, newRecord]);
        toast.success('Export address created successfully');
      }

      setExportFormData({
        companyName: '',
        gstNumber: '',
        address: '',
        country: '',
      });
      setExportErrors({});
    } catch (error) {
      toast.error('Error saving export address');
    } finally {
      setExportLoading(false);
    }
  };

  const handleSaveBank = async () => {
    const errors = validateBankForm();
    if (Object.keys(errors).length > 0) {
      setBankErrors(errors);
      toast.error('Please fix all errors before saving');
      return;
    }

    setBankLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (editingBankId) {
        setBankData(bankData.map(item =>
          item.id === editingBankId
            ? { ...bankFormData, id: editingBankId, status: item.status }
            : item
        ));
        toast.success('Bank details updated successfully');
        setEditingBankId(null);
      } else {
        const newRecord = {
          ...bankFormData,
          id: Date.now(),
          status: 'Active',
        };
        setBankData([...bankData, newRecord]);
        toast.success('Bank details created successfully');
      }

      setBankFormData({
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        branch: '',
      });
      setBankErrors({});
    } catch (error) {
      toast.error('Error saving bank details');
    } finally {
      setBankLoading(false);
    }
  };

  const handleSaveDept = async () => {
    const errors = validateDeptForm();
    if (Object.keys(errors).length > 0) {
      setDeptErrors(errors);
      toast.error('Please fix all errors before saving');
      return;
    }

    setDeptLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (editingDeptId) {
        setDeptData(deptData.map(item =>
          item.id === editingDeptId
            ? { ...deptFormData, id: editingDeptId, status: item.status }
            : item
        ));
        toast.success('Department updated successfully');
        setEditingDeptId(null);
      } else {
        const newRecord = {
          ...deptFormData,
          id: Date.now(),
          status: 'Active',
        };
        setDeptData([...deptData, newRecord]);
        toast.success('Department created successfully');
      }

      setDeptFormData({
        departmentName: '',
        departmentCode: '',
        managerName: '',
      });
      setDeptErrors({});
    } catch (error) {
      toast.error('Error saving department');
    } finally {
      setDeptLoading(false);
    }
  };

  const handleSaveApproval = async () => {
    const errors = validateApprovalForm();
    if (Object.keys(errors).length > 0) {
      setApprovalErrors(errors);
      toast.error('Please fix all errors before saving');
      return;
    }

    setApprovalLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (editingApprovalId) {
        setApprovalData(approvalData.map(item =>
          item.id === editingApprovalId
            ? { ...approvalFormData, id: editingApprovalId, status: item.status }
            : item
        ));
        toast.success('Approval configuration updated successfully');
        setEditingApprovalId(null);
      } else {
        const newRecord = {
          ...approvalFormData,
          id: Date.now(),
          status: 'Active',
        };
        setApprovalData([...approvalData, newRecord]);
        toast.success('Approval configuration created successfully');
      }

      setApprovalFormData({
        approvalType: '',
        level: '',
        assignedUser: '',
        status: 'Active',
      });
      setApprovalErrors({});
    } catch (error) {
      toast.error('Error saving approval configuration');
    } finally {
      setApprovalLoading(false);
    }
  };

  // ==================== RESET HANDLERS ====================

  const resetUserForm = () => {
    setUserFormData({ userName: '', employeeId: '', email: '', role: '' });
    setUserErrors({});
    setEditingUserId(null);
    toast.success('Form reset');
  };

  const resetExportForm = () => {
    setExportFormData({
      companyName: '',
      gstNumber: '',
      address: '',
      country: '',
    });
    setExportErrors({});
    setEditingExportId(null);
    toast.success('Form reset');
  };

  const resetBankForm = () => {
    setBankFormData({
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      branch: '',
    });
    setBankErrors({});
    setEditingBankId(null);
    toast.success('Form reset');
  };

  const resetDeptForm = () => {
    setDeptFormData({
      departmentName: '',
      departmentCode: '',
      managerName: '',
    });
    setDeptErrors({});
    setEditingDeptId(null);
    toast.success('Form reset');
  };

  const resetApprovalForm = () => {
    setApprovalFormData({
      approvalType: '',
      level: '',
      assignedUser: '',
      status: 'Active',
    });
    setApprovalErrors({});
    setEditingApprovalId(null);
    toast.success('Form reset');
  };

  // ==================== EDIT HANDLERS ====================

  const handleEditUser = (item) => {
    setUserFormData({
      userName: item.userName,
      employeeId: item.employeeId,
      email: item.email,
      role: item.role,
    });
    setEditingUserId(item.id);
    setExpandedSections({ ...expandedSections, user: true });
  };

  const handleEditExport = (item) => {
    setExportFormData({
      companyName: item.companyName,
      gstNumber: item.gstNumber,
      address: item.address,
      country: item.country,
    });
    setEditingExportId(item.id);
    setExpandedSections({ ...expandedSections, export: true });
  };

  const handleEditBank = (item) => {
    setBankFormData({
      bankName: item.bankName,
      accountNumber: item.accountNumber,
      ifscCode: item.ifscCode,
      branch: item.branch,
    });
    setEditingBankId(item.id);
    setExpandedSections({ ...expandedSections, bank: true });
  };

  const handleEditDept = (item) => {
    setDeptFormData({
      departmentName: item.departmentName,
      departmentCode: item.departmentCode,
      managerName: item.managerName,
    });
    setEditingDeptId(item.id);
    setExpandedSections({ ...expandedSections, department: true });
  };

  const handleEditApproval = (item) => {
    setApprovalFormData({
      approvalType: item.approvalType,
      level: item.level,
      assignedUser: item.assignedUser,
      status: item.status,
    });
    setEditingApprovalId(item.id);
    setExpandedSections({ ...expandedSections, approval: true });
  };

  // ==================== DELETE HANDLERS ====================

  const handleDeleteUser = (id) => {
    setUserdata(userdata.filter((item) => item.id !== id));
    toast.success('User deleted successfully');
  };

  const handleDeleteExport = (id) => {
    setExportData(exportData.filter((item) => item.id !== id));
    toast.success('Export address deleted successfully');
  };

  const handleDeleteBank = (id) => {
    setBankData(bankData.filter((item) => item.id !== id));
    toast.success('Bank details deleted successfully');
  };

  const handleDeleteDept = (id) => {
    setDeptData(deptData.filter((item) => item.id !== id));
    toast.success('Department deleted successfully');
  };

  const handleDeleteApproval = (id) => {
    setApprovalData(approvalData.filter((item) => item.id !== id));
    toast.success('Approval configuration deleted successfully');
  };

  // ==================== TOGGLE STATUS ====================

  const toggleUserStatus = (id) => {
    setUserdata(userdata.map((item) =>
      item.id === id
        ? { ...item, status: item.status === 'Active' ? 'Inactive' : 'Active' }
        : item
    ));
  };

  const toggleExportStatus = (id) => {
    setExportData(exportData.map((item) =>
      item.id === id
        ? { ...item, status: item.status === 'Active' ? 'Inactive' : 'Active' }
        : item
    ));
  };

  const toggleBankStatus = (id) => {
    setBankData(bankData.map((item) =>
      item.id === id
        ? { ...item, status: item.status === 'Active' ? 'Inactive' : 'Active' }
        : item
    ));
  };

  const toggleDeptStatus = (id) => {
    setDeptData(deptData.map((item) =>
      item.id === id
        ? { ...item, status: item.status === 'Active' ? 'Inactive' : 'Active' }
        : item
    ));
  };

  const toggleApprovalStatus = (id) => {
    setApprovalData(approvalData.map((item) =>
      item.id === id
        ? { ...item, status: item.status === 'Active' ? 'Inactive' : 'Active' }
        : item
    ));
  };

  // ==================== RENDER ====================

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-right" />

      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Company Config Master</h1>
              <p className="text-sm text-gray-600 mt-1">Create and manage Company Configuration</p>
            </div>
            <div className="hidden md:flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Global search..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="bg-transparent outline-none text-sm w-64 placeholder-gray-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* User Master Section */}
          <MasterSection
            title="User Master"
            icon={Plus}
            isOpen={expandedSections.user}
            onToggle={() =>
              setExpandedSections({ ...expandedSections, user: !expandedSections.user })
            }
            data={userdata}
            table={
              <DataTable
                data={userdata}
                columns={[
                  { key: 'userName', label: 'User Name' },
                  { key: 'employeeId', label: 'Employee ID' },
                  { key: 'email', label: 'Email' },
                  { key: 'role', label: 'Role' },
                ]}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
                onToggleStatus={toggleUserStatus}
                searchTerm={globalSearch}
                moduleId="user"
              />
            }
          >
            <div className={editingUserId ? 'border-b border-blue-200 pb-4 mb-4 bg-blue-50 p-4 rounded' : ''}>
              {editingUserId && (
                <p className="text-sm text-blue-700 font-medium flex items-center gap-2 mb-4">
                  <CheckCircle className="w-4 h-4" />
                  Editing User Record
                </p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="User Name"
                  name="userName"
                  value={userFormData.userName}
                  onChange={(e) =>
                    setUserFormData({ ...userFormData, userName: e.target.value })
                  }
                  placeholder="Enter user name"
                  error={userErrors.userName}
                  required
                />
                <FormInput
                  label="Employee ID"
                  name="employeeId"
                  value={userFormData.employeeId}
                  onChange={(e) =>
                    setUserFormData({ ...userFormData, employeeId: e.target.value })
                  }
                  placeholder="Enter employee ID"
                  error={userErrors.employeeId}
                  required
                />
                <FormInput
                  label="Email"
                  name="email"
                  value={userFormData.email}
                  onChange={(e) =>
                    setUserFormData({ ...userFormData, email: e.target.value })
                  }
                  placeholder="Enter email address"
                  error={userErrors.email}
                  required
                />
                <FormSelect
                  label="Role"
                  name="role"
                  value={userFormData.role}
                  onChange={(e) =>
                    setUserFormData({ ...userFormData, role: e.target.value })
                  }
                  options={[
                    { value: 'Admin', label: 'Admin' },
                    { value: 'Manager', label: 'Manager' },
                    { value: 'Supervisor', label: 'Supervisor' },
                    { value: 'User', label: 'User' },
                  ]}
                  error={userErrors.role}
                  required
                />
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={handleSaveUser}
                  disabled={userLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {userLoading ? 'Saving...' : editingUserId ? 'Update' : 'Save'}
                </button>
                <button
                  onClick={resetUserForm}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </div>
            </div>
          </MasterSection>

          {/* Export Address Master Section */}
          <MasterSection
            title="Export Authorized Address Master"
            icon={Plus}
            isOpen={expandedSections.export}
            onToggle={() =>
              setExpandedSections({ ...expandedSections, export: !expandedSections.export })
            }
            data={exportData}
            table={
              <DataTable
                data={exportData}
                columns={[
                  { key: 'companyName', label: 'Company Name' },
                  { key: 'gstNumber', label: 'GST Number' },
                  { key: 'country', label: 'Country' },
                ]}
                onEdit={handleEditExport}
                onDelete={handleDeleteExport}
                onToggleStatus={toggleExportStatus}
                searchTerm={globalSearch}
                moduleId="export"
              />
            }
          >
            <div className={editingExportId ? 'border-b border-blue-200 pb-4 mb-4 bg-blue-50 p-4 rounded' : ''}>
              {editingExportId && (
                <p className="text-sm text-blue-700 font-medium flex items-center gap-2 mb-4">
                  <CheckCircle className="w-4 h-4" />
                  Editing Export Address Record
                </p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Company Name"
                  name="companyName"
                  value={exportFormData.companyName}
                  onChange={(e) =>
                    setExportFormData({ ...exportFormData, companyName: e.target.value })
                  }
                  placeholder="Enter company name"
                  error={exportErrors.companyName}
                  required
                />
                <FormInput
                  label="GST Number"
                  name="gstNumber"
                  value={exportFormData.gstNumber}
                  onChange={(e) =>
                    setExportFormData({ ...exportFormData, gstNumber: e.target.value })
                  }
                  placeholder="Enter GST number"
                  error={exportErrors.gstNumber}
                  required
                />
                <FormSelect
                  label="Country"
                  name="country"
                  value={exportFormData.country}
                  onChange={(e) =>
                    setExportFormData({ ...exportFormData, country: e.target.value })
                  }
                  options={[
                    { value: 'India', label: 'India' },
                    { value: 'USA', label: 'USA' },
                    { value: 'UK', label: 'UK' },
                    { value: 'Germany', label: 'Germany' },
                    { value: 'Canada', label: 'Canada' },
                  ]}
                  error={exportErrors.country}
                  required
                />
              </div>

              <FormTextarea
                label="Address"
                name="address"
                value={exportFormData.address}
                onChange={(e) =>
                  setExportFormData({ ...exportFormData, address: e.target.value })
                }
                placeholder="Enter complete address"
                error={exportErrors.address}
                required
                rows={3}
              />

              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={handleSaveExport}
                  disabled={exportLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {exportLoading ? 'Saving...' : editingExportId ? 'Update' : 'Save'}
                </button>
                <button
                  onClick={resetExportForm}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </div>
            </div>
          </MasterSection>

          {/* Bank Details Master Section */}
          <MasterSection
            title="Bank Details Master"
            icon={Plus}
            isOpen={expandedSections.bank}
            onToggle={() =>
              setExpandedSections({ ...expandedSections, bank: !expandedSections.bank })
            }
            data={bankData}
            table={
              <DataTable
                data={bankData}
                columns={[
                  { key: 'bankName', label: 'Bank Name' },
                  { key: 'accountNumber', label: 'Account Number' },
                  { key: 'ifscCode', label: 'IFSC Code' },
                  { key: 'branch', label: 'Branch' },
                ]}
                onEdit={handleEditBank}
                onDelete={handleDeleteBank}
                onToggleStatus={toggleBankStatus}
                searchTerm={globalSearch}
                moduleId="bank"
              />
            }
          >
            <div className={editingBankId ? 'border-b border-blue-200 pb-4 mb-4 bg-blue-50 p-4 rounded' : ''}>
              {editingBankId && (
                <p className="text-sm text-blue-700 font-medium flex items-center gap-2 mb-4">
                  <CheckCircle className="w-4 h-4" />
                  Editing Bank Details Record
                </p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Bank Name"
                  name="bankName"
                  value={bankFormData.bankName}
                  onChange={(e) =>
                    setBankFormData({ ...bankFormData, bankName: e.target.value })
                  }
                  placeholder="Enter bank name"
                  error={bankErrors.bankName}
                  required
                />
                <FormInput
                  label="Account Number"
                  name="accountNumber"
                  value={bankFormData.accountNumber}
                  onChange={(e) =>
                    setBankFormData({ ...bankFormData, accountNumber: e.target.value })
                  }
                  placeholder="Enter account number"
                  error={bankErrors.accountNumber}
                  required
                />
                <FormInput
                  label="IFSC Code"
                  name="ifscCode"
                  value={bankFormData.ifscCode}
                  onChange={(e) =>
                    setBankFormData({ ...bankFormData, ifscCode: e.target.value })
                  }
                  placeholder="Enter IFSC code"
                  error={bankErrors.ifscCode}
                  required
                />
                <FormInput
                  label="Branch"
                  name="branch"
                  value={bankFormData.branch}
                  onChange={(e) =>
                    setBankFormData({ ...bankFormData, branch: e.target.value })
                  }
                  placeholder="Enter branch name"
                  error={bankErrors.branch}
                  required
                />
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={handleSaveBank}
                  disabled={bankLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {bankLoading ? 'Saving...' : editingBankId ? 'Update' : 'Save'}
                </button>
                <button
                  onClick={resetBankForm}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </div>
            </div>
          </MasterSection>

          {/* Department Master Section */}
          <MasterSection
            title="Department Master"
            icon={Plus}
            isOpen={expandedSections.department}
            onToggle={() =>
              setExpandedSections({ ...expandedSections, department: !expandedSections.department })
            }
            data={deptData}
            table={
              <DataTable
                data={deptData}
                columns={[
                  { key: 'departmentName', label: 'Department Name' },
                  { key: 'departmentCode', label: 'Department Code' },
                  { key: 'managerName', label: 'Manager Name' },
                ]}
                onEdit={handleEditDept}
                onDelete={handleDeleteDept}
                onToggleStatus={toggleDeptStatus}
                searchTerm={globalSearch}
                moduleId="department"
              />
            }
          >
            <div className={editingDeptId ? 'border-b border-blue-200 pb-4 mb-4 bg-blue-50 p-4 rounded' : ''}>
              {editingDeptId && (
                <p className="text-sm text-blue-700 font-medium flex items-center gap-2 mb-4">
                  <CheckCircle className="w-4 h-4" />
                  Editing Department Record
                </p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Department Name"
                  name="departmentName"
                  value={deptFormData.departmentName}
                  onChange={(e) =>
                    setDeptFormData({ ...deptFormData, departmentName: e.target.value })
                  }
                  placeholder="Enter department name"
                  error={deptErrors.departmentName}
                  required
                />
                <FormInput
                  label="Department Code"
                  name="departmentCode"
                  value={deptFormData.departmentCode}
                  onChange={(e) =>
                    setDeptFormData({ ...deptFormData, departmentCode: e.target.value })
                  }
                  placeholder="Enter department code"
                  error={deptErrors.departmentCode}
                  required
                />
                <FormInput
                  label="Manager Name"
                  name="managerName"
                  value={deptFormData.managerName}
                  onChange={(e) =>
                    setDeptFormData({ ...deptFormData, managerName: e.target.value })
                  }
                  placeholder="Enter manager name"
                  error={deptErrors.managerName}
                  required
                />
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={handleSaveDept}
                  disabled={deptLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {deptLoading ? 'Saving...' : editingDeptId ? 'Update' : 'Save'}
                </button>
                <button
                  onClick={resetDeptForm}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </div>
            </div>
          </MasterSection>

          {/* Approval Configuration Master Section */}
          <MasterSection
            title="Approval Configuration Master"
            icon={Plus}
            isOpen={expandedSections.approval}
            onToggle={() =>
              setExpandedSections({ ...expandedSections, approval: !expandedSections.approval })
            }
            data={approvalData}
            table={
              <DataTable
                data={approvalData}
                columns={[
                  { key: 'approvalType', label: 'Approval Type' },
                  { key: 'level', label: 'Level' },
                  { key: 'assignedUser', label: 'Assigned User' },
                ]}
                onEdit={handleEditApproval}
                onDelete={handleDeleteApproval}
                onToggleStatus={toggleApprovalStatus}
                searchTerm={globalSearch}
                moduleId="approval"
              />
            }
          >
            <div className={editingApprovalId ? 'border-b border-blue-200 pb-4 mb-4 bg-blue-50 p-4 rounded' : ''}>
              {editingApprovalId && (
                <p className="text-sm text-blue-700 font-medium flex items-center gap-2 mb-4">
                  <CheckCircle className="w-4 h-4" />
                  Editing Approval Configuration Record
                </p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSelect
                  label="Approval Type"
                  name="approvalType"
                  value={approvalFormData.approvalType}
                  onChange={(e) =>
                    setApprovalFormData({ ...approvalFormData, approvalType: e.target.value })
                  }
                  options={[
                    { value: 'Purchase', label: 'Purchase' },
                    { value: 'Expense', label: 'Expense' },
                    { value: 'Leave', label: 'Leave' },
                    { value: 'Invoice', label: 'Invoice' },
                  ]}
                  error={approvalErrors.approvalType}
                  required
                />
                <FormSelect
                  label="Level"
                  name="level"
                  value={approvalFormData.level}
                  onChange={(e) =>
                    setApprovalFormData({ ...approvalFormData, level: e.target.value })
                  }
                  options={[
                    { value: '1', label: 'Level 1' },
                    { value: '2', label: 'Level 2' },
                    { value: '3', label: 'Level 3' },
                    { value: '4', label: 'Level 4' },
                  ]}
                  error={approvalErrors.level}
                  required
                />
                <FormInput
                  label="Assigned User"
                  name="assignedUser"
                  value={approvalFormData.assignedUser}
                  onChange={(e) =>
                    setApprovalFormData({ ...approvalFormData, assignedUser: e.target.value })
                  }
                  placeholder="Enter assigned user name"
                  error={approvalErrors.assignedUser}
                  required
                />
                <FormSelect
                  label="Status"
                  name="status"
                  value={approvalFormData.status}
                  onChange={(e) =>
                    setApprovalFormData({ ...approvalFormData, status: e.target.value })
                  }
                  options={[
                    { value: 'Active', label: 'Active' },
                    { value: 'Inactive', label: 'Inactive' },
                  ]}
                  required
                />
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={handleSaveApproval}
                  disabled={approvalLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {approvalLoading ? 'Saving...' : editingApprovalId ? 'Update' : 'Save'}
                </button>
                <button
                  onClick={resetApprovalForm}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </div>
            </div>
          </MasterSection>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-gray-600">
          <p>Master Creation Management System | Last Updated: {new Date().toLocaleDateString()}</p>
        </div>
      </footer>
    </div>
  );
};

export default MasterManagement;