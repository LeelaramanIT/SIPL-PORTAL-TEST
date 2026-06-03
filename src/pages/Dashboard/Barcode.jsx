import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Copy, Download, Trash2, Eye, EyeOff, CheckCircle2, AlertCircle, FileUp, Upload } from 'lucide-react';

export default function Barcode() {
  const [activeTab, setActiveTab] = useState('excel'); // 'excel' or 'pdf'
  const [pastedData, setPastedData] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfFileName, setPdfFileName] = useState('');
  const [jsonData, setJsonData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [hiddenColumns, setHiddenColumns] = useState(new Set());
  const [feedback, setFeedback] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Parse data (works for both Excel paste and PDF text)
  const parseData = useCallback((text) => {
    try {
      const lines = text.trim().split('\n');
      if (lines.length === 0) {
        setFeedback({ type: 'error', message: 'No data provided' });
        return;
      }

      // Try to detect and parse structured data
      const parsedHeaders = lines[0].split('\t').map(h => h.trim()).filter(h => h);
      
      if (parsedHeaders.length === 0) {
        setFeedback({ type: 'error', message: 'No structured data found. Data should be tab-separated or contain headers.' });
        return;
      }

      const parsedRows = lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
          const values = line.split('\t');
          const row = {};
          parsedHeaders.forEach((header, index) => {
            row[header] = values[index]?.trim() || '';
          });
          return row;
        });

      if (parsedRows.length === 0) {
        setFeedback({ type: 'error', message: 'No valid rows found in data.' });
        return;
      }

      setHeaders(parsedHeaders);
      setJsonData(parsedRows);
      setHiddenColumns(new Set());
      setSortConfig({ key: null, direction: 'asc' });
      setFeedback({ type: 'success', message: `Parsed ${parsedRows.length} rows with ${parsedHeaders.length} columns` });
    } catch (error) {
      setFeedback({ type: 'error', message: 'Failed to parse data. Ensure proper tab separation.' });
    }
  }, []);

  // Handle Excel paste
  const handlePaste = useCallback((e) => {
    const text = e.target.value;
    setPastedData(text);
    if (text.trim()) {
      parseData(text);
    }
  }, [parseData]);

  // Extract text from PDF
  const extractPdfText = useCallback(async (file) => {
    setIsLoading(true);
    try {
      // Use PDF.js library
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      
      script.onload = async () => {
        const pdfjsLib = window.pdfjsWorker || window.pdfjs;
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join('\t');
          fullText += pageText + '\n';
        }
        
        parseData(fullText);
        setIsLoading(false);
      };
      
      script.onerror = () => {
        setFeedback({ type: 'error', message: 'Failed to load PDF library' });
        setIsLoading(false);
      };
      
      document.head.appendChild(script);
    } catch (error) {
      setFeedback({ type: 'error', message: 'Failed to read PDF file' });
      setIsLoading(false);
    }
  }, [parseData]);

  // Handle PDF file upload
  const handleFileUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setFeedback({ type: 'error', message: 'Please upload a PDF file' });
      return;
    }

    setPdfFile(file);
    setPdfFileName(file.name);
    extractPdfText(file);
  }, [extractPdfText]);

  // Toggle column visibility
  const toggleColumn = (column) => {
    const newHidden = new Set(hiddenColumns);
    if (newHidden.has(column)) {
      newHidden.delete(column);
    } else {
      newHidden.add(column);
    }
    setHiddenColumns(newHidden);
  };

  // Sort handler
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sorted and filtered data
  const displayData = useMemo(() => {
    let data = [...jsonData];

    if (searchTerm) {
      data = data.filter(row =>
        Object.values(row).some(val =>
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (sortConfig.key) {
      data.sort((a, b) => {
        const aVal = String(a[sortConfig.key]);
        const bVal = String(b[sortConfig.key]);
        const comparison = aVal.localeCompare(bVal, undefined, { numeric: true });
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    return data;
  }, [jsonData, sortConfig, searchTerm]);

  // Copy to clipboard
  const copyToClipboard = useCallback((text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      setFeedback({ type: 'success', message: `${type} copied to clipboard!` });
      setTimeout(() => setFeedback(''), 2000);
    });
  }, []);

  // Export as JSON file
  const exportJson = () => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(jsonData, null, 2)));
    element.setAttribute('download', 'data.json');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Clear all data
  const clearData = () => {
    setPastedData('');
    setPdfFile(null);
    setPdfFileName('');
    setJsonData([]);
    setHeaders([]);
    setHiddenColumns(new Set());
    setSortConfig({ key: null, direction: 'asc' });
    setSearchTerm('');
    setFeedback('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const visibleColumns = headers.filter(h => !hiddenColumns.has(h));
  const jsonString = JSON.stringify(jsonData, null, 2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-light tracking-tight text-slate-900">
              Data to JSON Converter
            </h1>
            <p className="text-slate-600 font-light">
              Import data from Excel or PDF and convert to JSON instantly
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Feedback Messages */}
        {feedback && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 animate-in fade-in duration-300 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="text-sm font-medium">{feedback.message}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('excel')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'excel'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Excel / Paste
          </button>
          <button
            onClick={() => setActiveTab('pdf')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'pdf'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            PDF Upload
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Input Section */}
          <div className="space-y-4">
            {activeTab === 'excel' ? (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-900">
                    Paste Excel Data
                  </label>
                  <p className="text-xs text-slate-500">
                    Copy from Excel and paste here. Data should be tab-separated.
                  </p>
                </div>
                <textarea
                  value={pastedData}
                  onChange={handlePaste}
                  placeholder="Paste your Excel data here..."
                  className="w-full h-80 p-4 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900 placeholder-slate-400 font-mono text-sm resize-none transition-all"
                />
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-900">
                    Upload PDF
                  </label>
                  <p className="text-xs text-slate-500">
                    Select a PDF file to extract data and convert to JSON
                  </p>
                </div>
                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="w-full h-80 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin mb-3">
                          <Upload className="w-8 h-8 text-blue-600" />
                        </div>
                        <p className="text-sm font-medium text-slate-900">Processing PDF...</p>
                      </>
                    ) : (
                      <>
                        <FileUp className="w-8 h-8 text-slate-400 mb-3" />
                        <p className="text-sm font-medium text-slate-900">Click to upload PDF</p>
                        <p className="text-xs text-slate-500 mt-1">or drag and drop</p>
                        {pdfFileName && (
                          <p className="text-xs text-blue-600 mt-3 font-medium">
                            Loaded: {pdfFileName}
                          </p>
                        )}
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
            
            <button
              onClick={clearData}
              disabled={!pastedData && !pdfFile && !jsonData.length}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 font-medium text-sm transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          </div>

          {/* JSON Output Section */}
          {jsonData.length > 0 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-900">
                  JSON Output
                </label>
                <p className="text-xs text-slate-500">
                  {jsonData.length} records ready to use
                </p>
              </div>
              <div className="relative">
                <pre className="w-full h-80 p-4 border border-slate-200 rounded-lg bg-slate-900 text-emerald-400 font-mono text-xs overflow-auto rounded-lg">
                  {jsonString}
                </pre>
                <button
                  onClick={() => copyToClipboard(jsonString, 'JSON')}
                  className="absolute top-3 right-3 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 transition-colors"
                  title="Copy JSON"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={exportJson}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors"
              >
                <Download className="w-4 h-4" />
                Download JSON
              </button>
            </div>
          )}
        </div>

        {/* Table Section */}
        {jsonData.length > 0 && (
          <div className="space-y-6">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search rows..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              
              {/* Column Visibility Toggle */}
              <div className="flex gap-2 flex-wrap">
                {headers.map(header => (
                  <button
                    key={header}
                    onClick={() => toggleColumn(header)}
                    className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-medium transition-colors ${
                      hiddenColumns.has(header)
                        ? 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    {hiddenColumns.has(header) ? (
                      <EyeOff className="w-3 h-3" />
                    ) : (
                      <Eye className="w-3 h-3" />
                    )}
                    {header}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Info */}
            <div className="text-sm text-slate-600">
              Showing {displayData.length} of {jsonData.length} records
            </div>

            {/* Table */}
            <div className="rounded-lg border border-slate-200 overflow-hidden bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                    <tr>
                      {visibleColumns.map(header => (
                        <th
                          key={header}
                          onClick={() => handleSort(header)}
                          className="px-6 py-4 text-left text-xs font-semibold text-slate-900 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                        >
                          <div className="flex items-center gap-2">
                            <span>{header}</span>
                            {sortConfig.key === header && (
                              <span className="text-blue-600">
                                {sortConfig.direction === 'asc' ? '↑' : '↓'}
                              </span>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {displayData.length === 0 ? (
                      <tr>
                        <td colSpan={visibleColumns.length} className="px-6 py-8 text-center">
                          <p className="text-slate-500 text-sm">No matching records found</p>
                        </td>
                      </tr>
                    ) : (
                      displayData.map((row, rowIndex) => (
                        <tr
                          key={rowIndex}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          {visibleColumns.map(header => (
                            <td
                              key={`${rowIndex}-${header}`}
                              className="px-6 py-4 text-sm text-slate-700"
                            >
                              <div className="truncate max-w-xs" title={row[header]}>
                                {row[header]}
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Copy Table as JSON */}
            <button
              onClick={() => copyToClipboard(jsonString, 'JSON')}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-sm transition-colors"
            >
              <Copy className="w-4 h-4" />
              Copy JSON
            </button>
          </div>
        )}

        {/* Empty State */}
        {jsonData.length === 0 && !pastedData && !pdfFile && (
          <div className="text-center py-20">
            <div className="mb-4 text-slate-400">
              <svg className="w-16 h-16 mx-auto opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">Ready to convert</h3>
            <p className="text-slate-600 max-w-md mx-auto">
              {activeTab === 'excel' 
                ? 'Copy data from Excel and paste it above to get started'
                : 'Upload a PDF file to extract and convert data to JSON'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}