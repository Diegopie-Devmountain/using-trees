import { ChangeEvent, RefObject, useRef, useState } from "react";
import { storageService } from "../../services/storageService";

interface DataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportData: () => void;
  onFileSelect: (e: ChangeEvent<HTMLInputElement>) => void;
  importError: string | null;
  fileInputRef: RefObject<HTMLInputElement>;
}

export const DataModal = ({ 
  isOpen, 
  onClose, 
  onExportData, 
  onFileSelect,
  importError,
  fileInputRef
}: DataModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 max-w-full">
        <h3 className="text-lg font-medium mb-4">Data Management</h3>
        
        <div className="mb-6">
          <h4 className="font-medium mb-2">Export Data</h4>
          <p className="text-sm text-gray-600 mb-3">
            Download all workspace and tree data as a JSON file.
          </p>
          <button
            onClick={onExportData}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          >
            Download JSON
          </button>
        </div>
        
        <div className="mb-6">
          <h4 className="font-medium mb-2">Import Data</h4>
          <p className="text-sm text-gray-600 mb-3">
            Import workspace and tree data from a JSON file.
          </p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileSelect}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          >
            Select JSON File
          </button>
          {importError && (
            <p className="mt-2 text-sm text-red-600">{importError}</p>
          )}
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};