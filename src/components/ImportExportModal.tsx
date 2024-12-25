import { useState } from "react";
import type { ExtendedFireInputs } from "../types/fire";

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (inputs: ExtendedFireInputs) => void;
  currentInputs: ExtendedFireInputs;
}

export default function ImportExportModal({
  isOpen,
  onClose,
  onImport,
  currentInputs,
}: ImportExportModalProps) {
  const [inputText, setInputText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleExport = () => {
    const exportText = JSON.stringify(currentInputs, null, 2);
    navigator.clipboard.writeText(exportText);
    setError("Copied to clipboard!");
    setTimeout(() => setError(null), 2000);
  };

  const handleImport = () => {
    try {
      const inputs = JSON.parse(inputText);
      // Basic validation
      if (typeof inputs !== "object") throw new Error("Invalid input format");
      if (typeof inputs.currentAge !== "number")
        throw new Error("Missing or invalid currentAge");
      if (typeof inputs.currentSavings !== "number")
        throw new Error("Missing or invalid currentSavings");
      if (typeof inputs.annualIncome !== "number")
        throw new Error("Missing or invalid annualIncome");
      if (typeof inputs.annualExpenses !== "number")
        throw new Error("Missing or invalid annualExpenses");

      onImport(inputs as ExtendedFireInputs);
      onClose();
      setInputText("");
      setError(null);
    } catch (err) {
      setError("Invalid input format. Please check your JSON data.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">
            Import/Export Calculator Data
          </h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Export Current Data
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Click the button below to copy your current calculator inputs to
                clipboard:
              </p>
              <button
                onClick={handleExport}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Copy to Clipboard
              </button>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-2">Import Data</h3>
              <p className="text-sm text-gray-600 mb-2">
                Paste your saved calculator data here:
              </p>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full h-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Paste your JSON data here..."
              />
              {error && (
                <p
                  className={`mt-2 text-sm ${
                    error.includes("Copied") ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {error}
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!inputText}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
              >
                Import
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
