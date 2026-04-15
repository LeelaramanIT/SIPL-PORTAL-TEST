import React, { useState } from "react";
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
} from "../components";

const Projects = () => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: "",
    name: "",
    type: "NEW DEV",
    priority: "HIGH",
    start: "",
    end: "",
  });
  const [openProject, setOpenProject] = useState(null);
  const [showModuleForm, setShowModuleForm] = useState(null);
  const [modules, setModules] = useState(MODULES);

  const [moduleForm, setModuleForm] = useState({
    name: "",
    order: "",
    status: "NOT_STARTED",
  });

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <div className="px-4 py-2 overflow-y-auto h-full custom-scrollbar">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div>
          <h1 className="text-[20px] font-bold text-gray-900 dark:text-[#F1F5F9] m-0">
            Projects
          </h1>
          <p className="text-[13px] text-[var(--primary)] dark:text-[#475569] mt-1">
            {PROJECTS.length} active projects
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

          <div className="grid grid-cols-3 gap-3 mb-3">
            {[
              ["Project code", "code", "e.g. TTS"],
              ["Project name", "name", "e.g. TTS System v2"],
            ].map(([label, key, ph]) => (
              <div key={key}>
                <label className="text-[11px] text-[var(--primary)] dark:text-[#475569] block mb-1">
                  {label}
                </label>
                <input
                  value={form[key]}
                  onChange={(e) => set(key, e.target.value)}
                  placeholder={ph}
                  className={inputStyle}
                />
              </div>
            ))}

            <div>
              <label className="text-[11px] text-[var(--primary)] dark:text-[#475569] block mb-1">
                Type
              </label>
              <select
                value={form.type}
                onChange={(e) => set("type", e.target.value)}
                className={selectStyle}
              >
                {["NEW DEV", "ENHANCEMENT", "SUPPORT"].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <label className="text-[11px] text-[var(--primary)] dark:text-[#475569] block mb-1">
                Priority
              </label>
              <select
                value={form.priority}
                onChange={(e) => set("priority", e.target.value)}
                className={selectStyle}
              >
                {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-[var(--primary)] dark:text-[#475569] block mb-1">
                Start date
              </label>
              <input
                type="date"
                value={form.start}
                onChange={(e) => set("start", e.target.value)}
                className={inputStyle}
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
                className={inputStyle}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button className={btnPrimary}>Create project</button>
            <button onClick={() => setShowForm(false)} className={btnGhost}>
              Cancel
            </button>
          </div>
        </Card>
      )}

      {/* Project List */}
      <div className="flex flex-col gap-3">
        {PROJECTS.map((p) => (
          <Card key={p.id}>
            <div className="flex items-start gap-4 flex-wrap">
              {/* Code Box */}
              <div
                className="w-12 h-12 rounded-[10px] flex items-center justify-center font-mono text-[13px] font-bold shrink-0
              bg-blue-100 border border-blue-300 text-blue-500
              dark:bg-[#1E3A5F] dark:border-[#2563EB44] dark:text-[#60A5FA]"
              >
                {p.code}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[15px] font-semibold text-gray-900 dark:text-[#F1F5F9]">
                    {p.name}
                  </span>

                  <Badge text={p.status} status={p.status} />
                  <PriBadge priority={p.priority} />

                  <span className="text-[11px] text-gray-500 dark:text-[#475569]">
                    {p.type}
                  </span>
                </div>

                <div className="text-[12px] text-gray-500 dark:text-[#475569] mb-2">
                  {p.start} → {p.end}
                </div>

                <ProgressBar pct={p.pct} color="#3B82F6" height={6} />

                <div className="flex justify-between mt-1">
                  <span className="text-[11px] text-gray-500 dark:text-[#475569]">
                    {MODULES.filter((m) => m.pid === p.id).length} modules
                  </span>

                  <span className="text-[11px] text-blue-600 dark:text-[#3B82F6] font-mono">
                    {p.pct}%
                  </span>
                </div>
              </div>

              {/* Modules */}
              {/* <div className="flex flex-col gap-1.5 items-end">
                {MODULES.filter((m) => m.pid === p.id).map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-1.5 text-[11px]"
                  >
                    <span className="text-gray-500 dark:text-[#475569]">
                      {m.name}
                    </span>

                    <Badge
                      text={m.status.replace("_", " ")}
                      status={m.status}
                    />

                    <span
                      className={`font-mono ${
                        m.pct === 100
                          ? "text-green-600 dark:text-[#10B981]"
                          : "text-blue-600 dark:text-[#3B82F6]"
                      }`}
                    >
                      {m.pct}%
                    </span>
                  </div>
                ))}
              </div> */}
              {/* Toggle Button */}
              <button
                onClick={() =>
                  setOpenProject(openProject === p.id ? null : p.id)
                }
                className="text-[12px] px-3 py-1 border rounded-md text-gray-600 dark:text-gray-300"
              >
                {openProject === p.id ? "Hide modules ▴" : "View modules ▾"}
              </button>
            </div>
            {/* Modules List */}
            {openProject === p.id && (
              <div className="w-full mt-4 border-t border-gray-200 dark:border-[#1E293B] pt-4">
                <div className="flex flex-col gap-2 mb-3">
                  {modules
                    .filter((m) => m.pid === p.id)
                    .map((m, index) => (
                      <div
                        key={m.id}
                        className="flex items-center gap-3 px-3 py-2 rounded-md
bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-[#1E293B]"
                      >
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[11px]
          bg-blue-100 text-blue-600 dark:bg-[#1E293B] dark:text-blue-400"
                        >
                          {index + 1}
                        </div>

                        <span className="flex-1 text-[13px] text-gray-800 dark:text-gray-100">
                          {m.name}
                        </span>

                        <div className="w-[80px]">
                          <ProgressBar pct={m.pct} color="#3B82F6" />
                        </div>

                        <span className="text-[11px] font-mono text-blue-600 dark:text-[#3B82F6] w-8 text-right">
                          {m.pct}%
                        </span>

                        <Badge
                          text={m.status.replace("_", " ")}
                          status={m.status}
                        />
                      </div>
                    ))}
                </div>
                <button
                  onClick={() => setShowModuleForm(p.id)}
                  className="w-full text-[12px] py-1 border border-dashed rounded-md 
text-gray-600 dark:text-gray-400 
hover:bg-gray-100 dark:hover:bg-[#1E293B] transition"
                >
                  + Add module
                </button>
              </div>
            )}
            {/* Add Module Form */}
            {showModuleForm === p.id && (
              <div className="bg-gray-50 dark:bg-[#0F172A] border border-[var(--border)] dark:border-[#2563EB44] p-3 rounded-md mb-2">
                <div className="text-[12px] font-semibold mb-2 text-gray-800 dark:text-gray-100">
                  New module
                </div>

                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    placeholder="Module name"
                    className={inputStyle}
                    value={moduleForm.name}
                    onChange={(e) =>
                      setModuleForm({ ...moduleForm, name: e.target.value })
                    }
                  />

                  <input
                    type="number"
                    placeholder="Order"
                    className={inputStyle}
                    value={moduleForm.order}
                    onChange={(e) =>
                      setModuleForm({ ...moduleForm, order: e.target.value })
                    }
                  />
                </div>

                <div className="mb-2">
                  <select
                    className={selectStyle}
                    value={moduleForm.status}
                    onChange={(e) =>
                      setModuleForm({ ...moduleForm, status: e.target.value })
                    }
                  >
                    <option value="NOT_STARTED">Not started</option>
                    <option value="IN_PROGRESS">In progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    className={btnPrimary}
                    onClick={() => {
                      if (!moduleForm.name) return;

                      const newModule = {
                        id: Date.now(),
                        pid: p.id,
                        name: moduleForm.name,
                        pct: 0,
                        status: moduleForm.status,
                      };

                      setModules([...modules, newModule]);
                      setShowModuleForm(null);
                      setModuleForm({
                        name: "",
                        order: "",
                        status: "NOT_STARTED",
                      });
                    }}
                  >
                    Save
                  </button>

                  <button
                    className={btnGhost}
                    onClick={() => setShowModuleForm(null)}
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
