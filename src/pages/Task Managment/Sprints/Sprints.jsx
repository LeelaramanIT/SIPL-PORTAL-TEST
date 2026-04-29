import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, DatePicker, InputNumber, Button, Space } from 'antd';
import dayjs from 'dayjs';
import { SPRINTS, MODULES, TASKS_DATA, USERS, getProgressColor } from '../data';
import { Card, Badge, Avatar, ProgressBar } from '../components';
import { getProjectList, getProjectModuel } from '../../../Redux/Slices/Task_Master/Sprint/SprintSlice';
import { useDispatch, useSelector } from 'react-redux';

const Sprints = () => {
  // State for the modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedProjectModules, setSelectedProjectModules] = useState([]);
  
  const dispatch = useDispatch();
  const { listOfProject, moduleLoading } = useSelector((state) => state.Sprint);
  
  // Fetch projects on component mount
  useEffect(() => {
    dispatch(getProjectList());
  }, [dispatch]);


  // Helper function to update available modules in dropdown based on selected project
  const updateModulesDropdown = (projectID) => {
    console.log('Updating modules dropdown for projectID:', projectID);
    
    const project = listOfProject.find((p) => p.projectID === projectID);
    if (project && project.modules && Array.isArray(project.modules)) {
      console.log('Found modules:', project.modules);
      setSelectedProjectModules(project.modules);
    } else {
      console.log('No modules found for project');
      setSelectedProjectModules([]);
    }
  };

  // Handle project selection
  const handleProjectSelect = (projectID) => {
    console.log('Selected projectID:', projectID);
    
    if (!projectID) {
      console.error('projectID is undefined or null');
      return;
    }

    // Update the modules dropdown with modules from the selected project
    updateModulesDropdown(projectID);
    
    // Optional: Clear the moduleId field when project changes
    form.setFieldValue('moduleId', undefined);
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const sprintData = {
        project: 'TTS System',
        projectId: values.projectId,
        moduleId: values.moduleId,
        name: values.name,
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate.format('YYYY-MM-DD'),
        points: values.points,
      };
      
      console.log('New Sprint Data:', sprintData);
      // TODO: Add logic to update your SPRINTS data array/backend here
      
      // Close modal and reset form
      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      console.error('Error creating sprint:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="w-full h-full flex flex-col p-2 md:p-4 transition-colors duration-300 relative">
      
      {/* Header Section */}
      <div className="mb-4 shrink-0 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 m-0">
            Sprints
          </h1>
          <p className="text-xs md:text-xs text-slate-500 dark:text-slate-400 mt-1">
            {SPRINTS.length} active cycles across TTS System
          </p>
        </div>
        
        {/* ADD SPRINT BUTTON */}
        <button 
          onClick={handleModalOpen}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Sprint
        </button>
      </div>

      {/* Scrollable List Container */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1">
        <div className="flex flex-col gap-4 max-w-7xl mx-auto pb-6">
          {SPRINTS.map((s) => {
            const module = MODULES.find((m) => m.id === s.mid);
            const tasks = TASKS_DATA.filter((t) => t.sprint === s.id);
            const pct = s.total > 0 ? Math.round((s.done / s.total) * 100) : 0;
            
            return (
              <Card key={s.id} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                {/* Top Info Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                      <span className="text-sm md:text-base font-bold text-slate-800 dark:text-slate-100 truncate">
                        {s.name}
                      </span>
                      <Badge 
                        text={s.status} 
                        status={s.status === 'ACTIVE' ? 'IN_PROGRESS' : s.status} 
                      />
                    </div>
                    <div className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 truncate uppercase tracking-wide">
                      {module?.name} · {s.start} → {s.end}
                    </div>
                  </div>
                  
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1">
                    <span className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono leading-none">
                      {pct}%
                    </span>
                    <span className="text-[10px] md:text-[11px] text-slate-400 dark:text-slate-500 font-medium uppercase">
                      {s.done}/{s.total} pts
                    </span>
                  </div>
                </div>
                <ProgressBar 
                  pct={pct} 
                  color={getProgressColor(pct)} 
                  height={6} 
                  className="bg-slate-100 dark:bg-slate-800"
                />
                {/* Backlog Section */}
                <div className="mt-5">
                  <div className="text-[9px] md:text-[10px] text-slate-400 dark:text-slate-500 tracking-[0.2em] font-mono mb-3 uppercase font-semibold">
                    Sprint Backlog
                  </div>
                  
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {tasks.map((t) => {
                      const user = USERS.find((u) => u.id === t.assignedTo);
                      return (
                        <div key={t.id} className="flex items-center gap-3 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40 group">
                          <span className="hidden sm:inline text-[10px] md:text-xs text-slate-400 dark:text-slate-500 font-mono w-14 shrink-0">
                            {t.code}
                          </span>
                          
                          <span className="flex-1 text-xs text-slate-600 dark:text-slate-300 truncate group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                            {t.title}
                          </span>
                          <div className="flex items-center gap-2 shrink-0">
                            <Avatar user={user} size={22} className="ring-1 ring-slate-200 dark:ring-slate-700" />
                            <div className="hidden xs:block">
                               <Badge text={t.status.replace('_', ' ')} status={t.status} />
                            </div>
                            <span className="hidden md:inline text-[10px] text-slate-400 dark:text-slate-500 font-mono w-8 text-right">
                              {t.est}h
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {tasks.length === 0 && (
                    <div className="text-xs text-slate-400 dark:text-slate-500 py-6 text-center italic border border-dashed border-slate-200 dark:border-slate-800 rounded-lg mt-2">
                      Empty backlog for this sprint
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ANT DESIGN MODAL */}
      <Modal
        title="Create New Sprint"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
        centered
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          requiredMark="optional"
        >
          {/* Project Selection */}
          <Form.Item
            label="Project"
            name="projectId"
            rules={[{ required: true, message: 'Please select a project' }]}
          >
            <Select
              placeholder="Select a Project"
              onChange={handleProjectSelect}
              options={listOfProject?.filter(p => p?.projectID)?.map((p) => ({
                label: p?.projectName || 'Unnamed Project',
                value: p?.projectID,
              })) || []}
            />
          </Form.Item>

          {/* Module Field (Populated from selected project's modules) */}
          <Form.Item
            label="Module"
            name="moduleId"
            rules={[{ required: true, message: 'Please select a module' }]}
          >
            <Select
              placeholder="Select a Module"
              loading={moduleLoading}
              options={selectedProjectModules?.map((m) => ({
                label: m?.moduleName || m?.name || 'Unnamed Module',
                value: m?.moduleID || m?.id,
              })) || []}
              notFoundContent={moduleLoading ? 'Loading modules...' : 'No modules available'}
            />
          </Form.Item>

          {/* Sprint Name Field */}
          <Form.Item
            label="Sprint Name"
            name="name"
            rules={[
              { required: true, message: 'Sprint name is required' },
              { min: 2, message: 'Sprint name must be at least 2 characters' },
            ]}
          >
            <Input placeholder="e.g. Sprint 1" />
          </Form.Item>

          {/* Dates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              label="Start Date"
              name="startDate"
              rules={[{ required: true, message: 'Start date is required' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label="End Date"
              name="endDate"
              rules={[
                { required: true, message: 'End date is required' },
                {
                  validator: (_, value) => {
                    const startDate = form.getFieldValue('startDate');
                    if (startDate && value && value.isBefore(startDate)) {
                      return Promise.reject(new Error('End date must be after start date'));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </div>

          {/* Total Points */}
          <Form.Item
            label="Total Points"
            name="points"
            rules={[
              { required: true, message: 'Total points is required' },
              { type: 'number', min: 0, message: 'Points must be 0 or greater' },
            ]}
          >
            <InputNumber min={0} placeholder="0" style={{ width: '100%' }} />
          </Form.Item>

          {/* Action Buttons */}
          <Form.Item style={{ marginTop: '32px', marginBottom: 0 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={handleCancel}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Create Sprint
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Sprints;