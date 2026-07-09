import { useState, useCallback, useRef } from "react";
import {
  Upload,
  FileSpreadsheet,
  X,
  Download,
  CheckCircle,
  AlertCircle,
  Loader2,
  Trash2,
} from "lucide-react";
import * as XLSX from "xlsx";
import ClientService from "../../../services/ClientService";
import { toast } from "react-toastify";

const TEMPLATE_COLUMNS = [
  { key: "first_name", label: "First Name", required: true },
  { key: "last_name", label: "Last Name", required: true },
  { key: "email", label: "Email", required: true },
  { key: "phone_number", label: "Phone Number", required: true },
  { key: "birthdate", label: "Birthdate (YYYY-MM-DD)", required: true },
  { key: "gender", label: "Gender (Male/Female/Other)", required: true },
  { key: "house_number", label: "House Number" },
  { key: "street", label: "Street" },
  { key: "city", label: "City" },
  { key: "state", label: "State" },
  { key: "country", label: "Country" },
  { key: "postal_code", label: "Postal Code" },
  { key: "length", label: "Length" },
  { key: "shoulder", label: "Shoulder" },
  { key: "upper_chest", label: "Upper Chest" },
  { key: "bust", label: "Bust" },
  { key: "waist", label: "Waist" },
  { key: "hip", label: "Hip" },
  { key: "seat", label: "Seat" },
  { key: "armhole", label: "Armhole" },
  { key: "sleeve_length", label: "Sleeve Length" },
  { key: "sleeve_circumference", label: "Sleeve Circumference" },
  { key: "front_neck_depth", label: "Front Neck Depth" },
  { key: "back_neck_depth", label: "Back Neck Depth" },
];

const REQUIRED_KEYS = ["first_name", "last_name", "email", "phone_number", "birthdate", "gender"];

function validateRows(rows) {
  return rows.map((row, idx) => {
    const errors = [];
    REQUIRED_KEYS.forEach((key) => {
      if (!row[key] || String(row[key]).trim() === "") {
        errors.push(`Missing "${TEMPLATE_COLUMNS.find((c) => c.key === key)?.label}"`);
      }
    });
    if (row.gender && !["Male", "Female", "Other"].includes(row.gender)) {
      errors.push(`Invalid gender "${row.gender}" — use Male, Female, or Other`);
    }
    if (row.birthdate && isNaN(Date.parse(row.birthdate))) {
      errors.push(`Invalid birthdate "${row.birthdate}" — use YYYY-MM-DD`);
    }
    return { ...row, _rowIndex: idx, _valid: errors.length === 0, _errors: errors };
  });
}

const ImportClientsModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState("upload"); // upload | preview | importing | results
  const [parsedRows, setParsedRows] = useState([]);
  const [fileName, setFileName] = useState("");
  const [importResults, setImportResults] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const reset = () => {
    setStep("upload");
    setParsedRows([]);
    setFileName("");
    setImportResults(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const processFile = useCallback((file) => {
    if (!file) return;
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx?|csv)$/i)) {
      toast.error("Please upload an Excel (.xlsx, .xls) or CSV file.");
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        if (jsonData.length === 0) {
          toast.error("The file is empty or has no recognizable data.");
          return;
        }

        const normalized = jsonData.map((row) => {
          const obj = {};
          Object.keys(row).forEach((key) => {
            const clean = key.trim().toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_");
            const col = TEMPLATE_COLUMNS.find(
              (c) =>
                c.key === clean ||
                c.key === key.trim().toLowerCase().replace(/\s+/g, "_") ||
                c.label.toLowerCase() === key.trim().toLowerCase()
            );
            if (col) {
              obj[col.key] = String(row[key]).trim();
            } else {
              obj[key] = String(row[key]).trim();
            }
          });
          return obj;
        });

        const validated = validateRows(normalized);
        setParsedRows(validated);
        setStep("preview");
      } catch {
        toast.error("Failed to parse the file. Please check the format.");
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const handleFileDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      processFile(file);
    },
    [processFile]
  );

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    processFile(file);
    e.target.value = "";
  };

  const handleImport = async () => {
    const validRows = parsedRows.filter((r) => r._valid);
    if (validRows.length === 0) {
      toast.error("No valid rows to import.");
      return;
    }
    setStep("importing");
    try {
      const payload = validRows.map((row) => {
        const obj = {};
        TEMPLATE_COLUMNS.forEach((col) => {
          if (row[col.key] !== undefined && row[col.key] !== "") {
            obj[col.key] = row[col.key];
          }
        });
        return obj;
      });

      const result = await ClientService.bulkImportClients(payload);
      setImportResults(result);
      setStep("results");
      if (result.created > 0) {
        toast.success(`Successfully imported ${result.created} client(s).`);
        onSuccess?.();
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || "Import failed. Please try again.");
      setStep("preview");
    }
  };

  const downloadTemplate = () => {
    const headerRow = {};
    TEMPLATE_COLUMNS.forEach((col) => {
      headerRow[col.label + (col.required ? " *" : "")] = "";
    });
    const exampleRow = {};
    TEMPLATE_COLUMNS.forEach((col) => {
      const examples = {
        first_name: "Jane",
        last_name: "Doe",
        email: "jane@example.com",
        phone_number: "+2348012345678",
        birthdate: "1995-06-15",
        gender: "Female",
        house_number: "12",
        street: "Main Street",
        city: "Lagos",
        state: "Lagos",
        country: "Nigeria",
        postal_code: "100001",
        length: "40",
        shoulder: "16",
        upper_chest: "36",
        bust: "38",
        waist: "30",
        hip: "40",
        seat: "42",
        armhole: "18",
        sleeve_length: "24",
        sleeve_circumference: "12",
        front_neck_depth: "8",
        back_neck_depth: "4",
      };
      exampleRow[col.label + (col.required ? " *" : "")] = examples[col.key] || "";
    });

    const ws = XLSX.utils.json_to_sheet([headerRow, exampleRow]);
    const colWidths = TEMPLATE_COLUMNS.map((col) => ({
      wch: Math.max(col.label.length + 4, 16),
    }));
    ws["!cols"] = colWidths;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Clients Template");
    XLSX.writeFile(wb, "client_import_template.xlsx");
  };

  if (!isOpen) return null;

  const validCount = parsedRows.filter((r) => r._valid).length;
  const errorCount = parsedRows.filter((r) => !r._valid).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Import Clients from Excel</h2>
              <p className="text-sm text-gray-500">Upload a spreadsheet with client details and measurements</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === "upload" && (
            <div className="space-y-6">
              {/* Download Template */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-blue-900">Need a template?</p>
                  <p className="text-sm text-blue-700">
                    Download the Excel template with all supported columns and an example row.
                  </p>
                </div>
                <button
                  onClick={downloadTemplate}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
                >
                  <Download className="w-4 h-4" />
                  Download Template
                </button>
              </div>

              {/* Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                  dragOver
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                }`}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-1">
                  Drop your Excel file here or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  Supports .xlsx, .xls, and .csv files
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Column Reference */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Supported Columns</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {TEMPLATE_COLUMNS.map((col) => (
                    <div key={col.key} className="flex items-center gap-1.5 text-xs text-gray-600">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${col.required ? "bg-red-400" : "bg-gray-300"}`}
                      />
                      {col.label}
                      {col.required && <span className="text-red-500">*</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === "preview" && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span className="font-medium">{fileName}</span>
                  <span className="text-gray-400">—</span>
                  <span>{parsedRows.length} row(s) found</span>
                </div>
                {validCount > 0 && (
                  <span className="flex items-center gap-1 text-sm text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                    <CheckCircle className="w-3.5 h-3.5" />
                    {validCount} valid
                  </span>
                )}
                {errorCount > 0 && (
                  <span className="flex items-center gap-1 text-sm text-red-700 bg-red-50 px-2.5 py-1 rounded-full">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errorCount} with errors
                  </span>
                )}
                <button
                  onClick={() => {
                    reset();
                    fileInputRef.current?.click();
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 underline ml-auto"
                >
                  Choose a different file
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Preview Table */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto max-h-[400px]">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-3 py-2.5 text-left font-medium text-gray-600 w-12">#</th>
                        <th className="px-3 py-2.5 text-left font-medium text-gray-600 w-16">Status</th>
                        {TEMPLATE_COLUMNS.map((col) => (
                          <th
                            key={col.key}
                            className="px-3 py-2.5 text-left font-medium text-gray-600 whitespace-nowrap"
                          >
                            {col.label}
                            {col.required && <span className="text-red-500 ml-0.5">*</span>}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {parsedRows.map((row, idx) => (
                        <tr
                          key={idx}
                          className={row._valid ? "bg-white" : "bg-red-50/50"}
                        >
                          <td className="px-3 py-2 text-gray-400">{idx + 1}</td>
                          <td className="px-3 py-2">
                            {row._valid ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <div className="group relative">
                                <AlertCircle className="w-4 h-4 text-red-500 cursor-help" />
                                <div className="hidden group-hover:block absolute left-0 top-6 z-10 bg-red-600 text-white text-xs rounded-lg p-2 whitespace-nowrap shadow-lg">
                                  {row._errors.join(", ")}
                                </div>
                              </div>
                            )}
                          </td>
                          {TEMPLATE_COLUMNS.map((col) => (
                            <td key={col.key} className="px-3 py-2 text-gray-700 max-w-[120px] truncate">
                              {row[col.key] || <span className="text-gray-300">—</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {step === "importing" && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
              <p className="text-lg font-medium text-gray-700">Importing clients...</p>
              <p className="text-sm text-gray-500 mt-1">
                Processing {validCount} client(s). This may take a moment.
              </p>
            </div>
          )}

          {step === "results" && importResults && (
            <div className="space-y-6">
              <div className="text-center py-4">
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                    importResults.created > 0 ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  {importResults.created > 0 ? (
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  ) : (
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Import Complete</h3>
                <p className="text-gray-500 mt-1">
                  {importResults.created} client(s) imported, {importResults.skipped} skipped
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">{importResults.total}</div>
                  <div className="text-sm text-gray-500">Total Rows</div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{importResults.created}</div>
                  <div className="text-sm text-gray-500">Imported</div>
                </div>
                <div className="bg-red-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{importResults.skipped}</div>
                  <div className="text-sm text-gray-500">Skipped</div>
                </div>
              </div>

              {/* Error details */}
              {importResults.results && importResults.results.filter((r) => r.status === "error").length > 0 && (
                <div className="border border-red-200 rounded-xl overflow-hidden">
                  <div className="bg-red-50 px-4 py-2.5 border-b border-red-200">
                    <p className="text-sm font-medium text-red-800">Rows with Errors</p>
                  </div>
                  <div className="max-h-[200px] overflow-y-auto divide-y divide-gray-100">
                    {importResults.results
                      .filter((r) => r.status === "error")
                      .map((r, i) => (
                        <div key={i} className="px-4 py-2.5 text-sm">
                          <span className="font-medium text-gray-700">Row {r.row}:</span>{" "}
                          <span className="text-red-600">{r.errors?.join("; ")}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          {step === "preview" && (
            <>
              <button
                onClick={reset}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={validCount === 0}
                className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Upload className="w-4 h-4" />
                Import {validCount} Client(s)
              </button>
            </>
          )}
          {step === "results" && (
            <button
              onClick={handleClose}
              className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportClientsModal;
