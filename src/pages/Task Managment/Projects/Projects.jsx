import React, { useEffect, useState } from "react";
import { PROJECTS, MODULES } from "../data";
import {
  Card,
  SectionTitle,
  Badge,
  PriBadge,
  ProgressBar,
  btnPrimary,
  btnGhost,
  inputStyle,
  selectStyle,
  Owners,
} from "../components";
import { useDispatch, useSelector } from "react-redux";
import {
  createModuel,
  fetchMaster,
  getProjectList,
  getProjectModuel,
  projectCreate,
} from "../../../Redux/Slices/Task_Master/Projects/ProjectSlice";

const Projects = () => {
  const dispatch = useDispatch();
  const { priorities, projectTypes, taskTypes, projectStatus } = useSelector(
    (state) => state.Project.master,
  );
  const { listOfProject } = useSelector((state) => state.Project);
  // console.log("priorities:", priorities);
  // console.log("projectTypes:", projectTypes);
  // console.log("taskTypes:", taskTypes);
  // console.log("projectStatus:", projectStatus);
  console.log("list", listOfProject);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: "",
    name: "",
    type: "NEW_DEV",
    priority: 1,
    start: "",
    end: "",
    buisnessOwners: "",
    buisnessDepartment: "",
    projectOwner: "",
    buisnessdivision: "",
    description: "",
    projectStatus: 1, 
    Estimate: "",
  });

  const [moduleForm, setModuleForm] = useState({
    name: "",
    order: "",
    description: "", // Add this
    status: "NOT_STARTED",
  });

  const [openProject, setOpenProject] = useState(null);
  const [showModuleForm, setShowModuleForm] = useState(null);
  const [modules, setModules] = useState(MODULES);

  useEffect(() => {
    dispatch(getProjectList());
  }, []);

  useEffect(() => {
    if (showForm) {
      console.log("print");

      dispatch(fetchMaster("/ProjectMaster/tasktypes", "taskTypes"));
      dispatch(fetchMaster("/ProjectMaster/projecttypes", "projectTypes"));
      dispatch(fetchMaster("/ProjectMaster/priorities", "priorities"));
      dispatch(fetchMaster("/ProjectMaster/status/Project", "projectStatus"));
      dispatch(
        fetchMaster(
          "/ProjectMaster/departmentdivisions",
          "departmentdivisions",
        ),
      );
    }
  }, [showForm]);
  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    const payload = {
      projectCode: form.code,
      projectName: form.name,
      description: form.description,
      projectType: form.type, // Convert to Number

      priorityID: Number(form.priority), // Ensure Number
      statusID: Number(form.projectStatus), // Ensure Number

      startDate: form.start ? new Date(form.start).toISOString() : null,
      endDate: form.end ? new Date(form.end).toISOString() : null,

      estHours: Number(form.Estimate || 0),
      createdBy: 1,

      buisnessOwners: form.buisnessOwners,
      buisnessOwnersDepartment: form.buisnessDepartment,
      projectOwner: form.projectOwner,
      buisnesDivision: form.buisnessdivision,
    };

    console.log("Final Payload for Backend:", payload);
    await dispatch(projectCreate(payload));
  };

  const handleToggleProject = (projectID) => {
    if (openProject === projectID) {
      setOpenProject(null);
      setShowModuleForm(null);
    } else {
      setOpenProject(projectID);
      // Fetch modules from the API for this specific project
      dispatch(getProjectModuel(projectID));
    }
  };

  const handleSubmitModule = async (projectId) => {
    const payload = {
      projectID: projectId, // Linked Project
      moduleName: moduleForm.name, // "Module name"
      displayOrder: Number(moduleForm.order), // "Display order" (converted to Number)
      description: moduleForm.description, // "Description"
      statusID: moduleForm.status, // "Status" (e.g., 'IN_PROGRESS')
      createdBy: 1, // Default or from Auth
    };
    const data = dispatch(createModuel(payload))
    console.log("Saving Module Payload:", payload);
    
  };

  return (
    <div className="px-4 py-2 overflow-y-auto h-full custom-scrollbar">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div>
          <h1 className="text-[20px] font-bold text-gray-900 dark:text-[#F1F5F9] m-0">
            Projects
          </h1>
          <p className="text-[13px] text-[var(--primary)] dark:text-[#475569] mt-1">
            {listOfProject?.length} active projects
          </p>
        </div>

        <button onClick={() => setShowForm(!showForm)} className={btnPrimary}>
          + New project
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <Card style={{ borderColor: "#2563EB44" }} className="mb-5">
          <SectionTitle>Create project</SectionTitle>

          <div className="grid grid-cols-5 gap-3 mb-3">
            {[
              ["Project code", "code", "e.g. TTS"],
              ["Project name", "name", "e.g. TTS System v2"],
            ].map(([label, key, ph]) => (
              <InputField
                key={key}
                label={label}
                value={form[key]}
                onChange={(e) => set(key, e.target.value)}
                placeholder={ph}
                inputStyle={inputStyle}
                maxLength={4}
              />
            ))}

            <SelectField
              label="Type"
              value={form.type}
              onChange={(e) => set("type", e.target.value)}
              options={projectTypes}
              optionLabel="typeName" // Matches log
              optionValue="typeCode" // Changed from typeCode to ID for consistency
              selectStyle={selectStyle}
            />

            <SelectField
              label="Priority"
              value={form.priority}
              onChange={(e) => set("priority", e.target.value)}
              options={priorities}
              optionLabel="priorityName" // Matches log
              optionValue="priorityID" // Matches log
              selectStyle={selectStyle}
            />

            <SelectField
              label="Project Status"
              value={form.projectStatus}
              onChange={(e) => set("projectStatus", e.target.value)}
              options={projectStatus}
              optionLabel="statusName" // Currently "typeName" in your log
              optionValue="statusID" // Currently "projectTypeID" in your log
              selectStyle={selectStyle}
            />
          </div>

          <div className="grid grid-cols-5 gap-3 mb-3">
            <InputField
              label="Business Owner"
              value={form.buisnessOwners}
              onChange={(e) => set("buisnessOwners", e.target.value)}
              placeholder="Enter business owner"
              inputStyle={inputStyle}
            />

            <InputField
              label="Business Department"
              value={form.buisnessDepartment}
              onChange={(e) => set("buisnessDepartment", e.target.value)}
              placeholder="Enter department"
              inputStyle={inputStyle}
            />

            <InputField
              label="Project Owner"
              value={form.projectOwner}
              onChange={(e) => set("projectOwner", e.target.value)}
              placeholder="Enter project owner"
              inputStyle={inputStyle}
            />

            <InputField
              label="Business Division"
              value={form.buisnessdivision}
              onChange={(e) => set("buisnessdivision", e.target.value)}
              placeholder="Enter division"
              inputStyle={inputStyle}
            />

            <InputField
              label="Estimate Hours"
              value={form.Estimate}
              onChange={(e) => set("Estimate", e.target.value)}
              placeholder="Enter Estimate hr"
              inputStyle={inputStyle}
            />
          </div>

          <div className="grid grid-cols-4 gap-3 mb-4">
            <TextareaField
              label="Description"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Enter description..."
              inputStyle={inputStyle}
            />

            <div>
              <label className="text-[11px] text-[var(--primary)] dark:text-[#475569] block mb-1">
                Start date
              </label>
              <input
                type="date"
                value={form.start}
                onChange={(e) => set("start", e.target.value)}
                className={`${inputStyle} dark:[color-scheme:dark]`}
              />
            </div>

            <div>
              <label className="text-[11px] text-[var(--primary)] dark:text-[#475569] block mb-1">
                End date
              </label>
              <input
                type="date"
                value={form.end}
                onChange={(e) => set("end", e.target.value)}
                className={`${inputStyle} dark:[color-scheme:dark]`}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={handleSubmit} className={btnPrimary}>
              Create project
            </button>
            <button onClick={() => setShowForm(false)} className={btnGhost}>
              Cancel
            </button>
          </div>
        </Card>
      )}

      {/* Project List */}
      <div className="flex flex-col gap-3">
        {listOfProject.map((p) => (
          <Card key={p.projectID}>
            <div className="flex items-start gap-4 flex-wrap">
              {/* Code Box */}
              <div
                className="w-12 h-12 rounded-[10px] flex items-center justify-center font-mono text-[13px] font-bold shrink-0
          bg-blue-100 border border-blue-300 text-blue-500
          dark:bg-[#1E3A5F] dark:border-[#2563EB44] dark:text-[#60A5FA]"
              >
                {p.projectCode.toUpperCase()}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[15px] font-semibold text-gray-900 dark:text-[#F1F5F9]">
                    {p.projectName}
                  </span>

                  {/* Matching status and priority from JSON */}
                  <Badge text={p.statusName} status={p.statusCode} />
                  <PriBadge
                    priority={(p.priorityName || "LOW").toUpperCase()}
                  />

                  <span className="text-[13px] text-gray-500 font-semibold dark:text-gray-200 flex gap-1">
                    <Owners
                      text={p.projectType}
                      className="text-[11px] px-2 py-[2px] rounded-md font-mono whitespace-nowrap bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--border)]"
                    />

                    <Owners
                      text={p.projectOwner}
                      className="text-[11px] px-2 py-[2px] rounded-md font-mono whitespace-nowrap bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--border)]"
                    />

                    <Owners
                      text={p.buisnessOwners}
                      className="text-[11px] px-2 py-[2px] rounded-md font-mono whitespace-nowrap bg-pink-300/10 text-pink-600 border border-pink-500/50"
                    />

                    <Owners
                      text={p.buisnessOwnersDepartment}
                      className="text-[11px] px-2 py-[2px] rounded-md font-mono whitespace-nowrap bg-pink-300/10 text-pink-600 border border-pink-500/50"
                    />
                  </span>
                </div>

                <div className="text-[12px] text-gray-500 dark:text-[#475569] mb-2">
                  {/* Formatting the ISO dates to a readable string if needed, or keeping as is */}
                  {new Date(p.startDate).toLocaleDateString()} →{" "}
                  {new Date(p.endDate).toLocaleDateString()}
                </div>

                {/* Using completionPct from your API */}
                <ProgressBar pct={p.completionPct} color="#3B82F6" height={6} />

                <div className="flex justify-between mt-1">
                  <span className="text-[11px] text-gray-500 dark:text-[#475569]">
                    {p.totalModules} modules
                  </span>

                  <span className="text-[11px] text-blue-600 dark:text-[#3B82F6] font-mono">
                    {p.completionPct}%
                  </span>
                </div>
              </div>

              {/* Toggle Button - using projectID */}
              <button
                onClick={() => handleToggleProject(p.projectID)}
                className={btnPrimary}
              >
                {openProject === p.projectID
                  ? "Hide modules ▴"
                  : "View modules ▾"}
              </button>
            </div>

            {/* Modules List - using p.projectID to filter */}
            {openProject === p.projectID && (
              <div className="w-full mt-4 border-t border-gray-200 dark:border-[#1E293B] pt-4">
                <div className="flex flex-col gap-2 mb-3">
                  {p?.modules
                    ?.filter((m) => m.projectID === p.projectID)
                    ?.map((m, index) => (
                      <div
                        key={m.moduleID}
                        className="flex items-center gap-3 px-3 py-2 rounded-md bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-[#1E293B]"
                      >
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] bg-blue-100 text-blue-600 dark:bg-[#1E293B] dark:text-blue-400">
                          {index + 1}
                        </div>
                        <span className="flex-1 text-[13px] text-gray-800 dark:text-gray-100">
                          {m.moduleName} - {m.description}
                        </span>
                        <div className="w-[80px]">
                          <ProgressBar pct={m.pct} color="#3B82F6" />
                        </div>
                        <span className="text-[11px] font-mono text-blue-600 dark:text-[#3B82F6] w-8 text-right">
                          {m.completionPct}%
                        </span>
                        <Badge
                          text={m.statusCode.replace("_", " ")}
                          status={m.statusCode.toUpperCase()}
                        />
                      </div>
                    ))}
                </div>
                <button
                  onClick={() => setShowModuleForm(p.projectID)}
                  className="w-full text-[12px] py-1 border border-dashed rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1E293B] transition"
                >
                  + Add module
                </button>
              </div>
            )}

            {/* Add Module Form */}
            {/* Add Module Form */}
            {showModuleForm === p.projectID && (
              <div className="bg-gray-50 dark:bg-[#0F172A] border border-blue-200 dark:border-[#2563EB44] p-4 rounded-md mb-4 shadow-sm">
                <div className="text-[12px] font-semibold mb-3 text-gray-800 dark:text-gray-100">
                  New module
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <InputField
                    label="Module name"
                    placeholder="e.g. Dispatch module"
                    inputStyle={inputStyle}
                    value={moduleForm.name}
                    onChange={(e) =>
                      setModuleForm({ ...moduleForm, name: e.target.value })
                    }
                  />
                  <InputField
                    label="Display order"
                    type="number"
                    placeholder="e.g. 4"
                    inputStyle={inputStyle}
                    value={moduleForm.order}
                    onChange={(e) =>
                      setModuleForm({ ...moduleForm, order: e.target.value })
                    }
                  />
                </div>

                <div className="mb-3">
                  <InputField
                    label="Description"
                    placeholder="e.g. Final dispatch, document generation..."
                    inputStyle={inputStyle}
                    value={moduleForm.description}
                    onChange={(e) =>
                      setModuleForm({
                        ...moduleForm,
                        description: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <SelectField
                    label="Status"
                    selectStyle={selectStyle}
                    value={moduleForm.status}
                    onChange={(e) =>
                      setModuleForm({ ...moduleForm, status: e.target.value })
                    }
                    options={projectStatus}
                    optionLabel="statusName" // Currently "typeName" in your log
                    optionValue="statusID"
                  />
                  <div>
                    <label className="text-[11px] text-gray-500 block mb-1">
                      Project
                    </label>
                    <input
                      value={p.projectName}
                      disabled
                      className={`${inputStyle} opacity-60 cursor-not-allowed`}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleSubmitModule(p.projectID)}
                    className={btnPrimary}
                  >
                    Save module
                  </button>
                  <button
                    onClick={() => setShowModuleForm(null)}
                    className={btnGhost}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Projects;

const InputField = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  className = "",
  inputStyle,
  maxLength
}) => {
  return (
    <div>
      {label && (
        <label className="text-[11px] text-[var(--primary)] dark:text-[#475569] block mb-1">
          {label}
        </label>
      )}

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${inputStyle} ${className}`}
        maxLength={maxLength}
      />
    </div>
  );
};

const SelectField = ({
  label,
  value,
  onChange,
  options = [],
  optionLabel,
  optionValue,
  selectStyle,
}) => {
  return (
    <div>
      {label && (
        <label className="text-[11px] text-[var(--primary)] dark:text-[#475569] block mb-1">
          {label}
        </label>
      )}

      <select value={value} onChange={onChange} className={selectStyle}>
        {options?.map((o, i) => (
          <option key={i} value={o[optionValue]}>
            {o[optionLabel]}
          </option>
        ))}
      </select>
    </div>
  );
};

const TextareaField = ({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  inputStyle,
}) => {
  return (
    <div>
      {label && (
        <label className="text-[11px] text-[var(--primary)] dark:text-[#475569] block mb-1">
          {label}
        </label>
      )}

      <textarea
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={inputStyle}
      />
    </div>
  );
};
