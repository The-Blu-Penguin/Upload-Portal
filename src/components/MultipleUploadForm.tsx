"use client";

import { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { DialogState, AuthCredentials } from '../types';
import { updateMultipleMerchants } from '../lib/apiClient';
import ExcelTemplateDownload from './ExcelTemplateDownload';
import ResponseDialog from './ResponseDialog';
import ProgressBar from './ProgressBar';
import LoginModal from './LoginModal';

interface ExcelRowData {
  [key: string]: string | undefined;
  merchantId?: string;
  incorporationDate?: string;
  contactPersonName?: string;
  contactPersonEmail?: string;
  contactPersonPhone?: string;
  contactPersonRelation?: string;
  companyRegistrationNumber?: string;
}

export default function MultipleUploadForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [previewData, setPreviewData] = useState<ExcelRowData[]>([]);
  const [totalRowCount, setTotalRowCount] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [retryCount, setRetryCount] = useState<number>(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [dialogState, setDialogState] = useState<DialogState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'success',
  });

  const formatDateString = (dateString: string): string => {
    if (!dateString) return '';
    
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    
    if (dateString.includes('/')) {
      const parts = dateString.split('/');
      if (parts.length === 3) {
        if (parseInt(parts[0]) > 12) {
          return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
        return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
      }
    }
    
    return dateString;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFileName(file.name);
    
    if (file.name !== 'merchant-template.xlsx') {
      toast('For best results, use the provided merchant-template.xlsx file', {
        icon: '⚠️',
        duration: 5000,
        position: 'top-right',
      });
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const sheetName = workbook.SheetNames.includes('MerchantData')
          ? 'MerchantData'
          : workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:F2');
        const headers: string[] = [];

        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellAddress = { r: 0, c: C };
          const cellRef = XLSX.utils.encode_cell(cellAddress);

          if (worksheet[cellRef]) {
            headers.push(worksheet[cellRef].v.toString());
          } else {
            headers.push(`Column${C}`);
          }
        }

        const jsonData = XLSX.utils.sheet_to_json<Record<string, string | number>>(worksheet, {
          header: headers,
          range: 1,
          raw: false,
          defval: ''
        });
        
        if (jsonData.length === 0) {
          setDialogState({
            isOpen: true,
            title: 'Empty File',
            message: 'The Excel file does not contain any data. Please check the file and try again.',
            type: 'error',
          });
          resetFileInput();
          return;
        }
        
        const expectedColumns = [
          'merchantId',
          'incorporationDate',
          'contactPersonName',
          'contactPersonEmail',
          'contactPersonPhone',
          'contactPersonRelation',
          'companyRegistrationNumber',
        ];
        
        const normalizedData = jsonData.map((row: Record<string, string | number>) => {
          const normalizedRow: ExcelRowData = {};
          
          expectedColumns.forEach(col => {
            const matchingKey = Object.keys(row).find(
              key => key.toLowerCase() === col.toLowerCase()
            );
            
            if (matchingKey) {
              normalizedRow[col] = String(row[matchingKey] || '');
            } else {
              normalizedRow[col] = '';
            }
          });
          
          return normalizedRow;
        });

        setTotalRowCount(normalizedData.length);
        setPreviewData(normalizedData.slice(0, 5));
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        setDialogState({
          isOpen: true,
          title: 'Invalid File',
          message: 'The Excel file format is invalid. Please use the provided merchant-template.xlsx file.',
          type: 'error',
        });
        resetFileInput();
      }
    };
    
    reader.readAsArrayBuffer(file);
  };

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setFileName('');
    setPreviewData([]);
    setTotalRowCount(0);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!fileInputRef.current?.files?.[0]) {
      setDialogState({
        isOpen: true,
        title: 'Missing File',
        message: 'Please select an Excel file before uploading.',
        type: 'error',
      });
      return;
    }
    
    setShowLoginModal(true);
  };

  const handleLoginSubmit = async (credentials: AuthCredentials) => {
    if (!fileInputRef.current?.files?.[0]) return;
    
    setIsLoading(true);
    setUploadProgress(0);
    setRetryCount(0);
    setUploadStatus('Preparing upload...');
    
    // Simulate initial progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev < 20) return prev + 5;
        if (prev < 80) return prev + 2;
        return prev;
      });
    }, 200);
    
    try {
      const file = fileInputRef.current.files[0];
      
      setUploadStatus('Uploading file...');
      setUploadProgress(30);
      
      // Custom retry config with progress tracking
      const retryConfig = {
        maxRetries: 3,
        initialDelay: 1000,
        maxDelay: 10000,
        backoffMultiplier: 2,
      };
      
      // Track retry attempts
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        try {
          const response = await originalFetch(...args);
          if (!response.ok && response.status >= 500) {
            setRetryCount(prev => {
              const newCount = prev + 1;
              setUploadStatus(`Retrying upload (attempt ${newCount})...`);
              return newCount;
            });
          }
          return response;
        } catch (error) {
          setRetryCount(prev => {
            const newCount = prev + 1;
            setUploadStatus(`Connection error. Retrying (attempt ${newCount})...`);
            return newCount;
          });
          throw error;
        }
      };
      
      setUploadProgress(50);
      const response = await updateMultipleMerchants(file, credentials, retryConfig);
      
      // Restore original fetch
      window.fetch = originalFetch;
      
      clearInterval(progressInterval);
      setUploadStatus('Processing response...');
      setUploadProgress(90);
      
      // Check if the API response includes status or statusCode
      const isSuccessResponse = 
        response.success === true || 
        response.status === 200 || 
        response.statusCode === 200;
      
      setUploadProgress(100);
      setShowLoginModal(false);
      
      if (isSuccessResponse) {
        setUploadStatus('Upload complete!');
        setTimeout(() => {
          setDialogState({
            isOpen: true,
            title: 'Upload Successful',
            message: `Successfully updated ${totalRowCount} merchant${totalRowCount !== 1 ? 's' : ''}.`,
            type: 'success',
            additionalAction: {
              label: 'Upload Another',
              onClick: () => {
                resetFileInput();
                setUploadProgress(0);
                setUploadStatus('');
                setRetryCount(0);
              }
            }
          });
        }, 500);
        resetFileInput();
      } else {
        setUploadStatus('Upload failed');
        // If the response contains an error array, show the first error message
        const errorMessage = 
          response.errors && response.errors.length > 0 
            ? response.errors[0].message 
            : response.message || 'Failed to update merchants. Please try again.';
            
        setDialogState({
          isOpen: true,
          title: 'Upload Failed',
          message: errorMessage,
          type: 'error',
        });
        setUploadProgress(0);
      }
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Upload error:', error);
      setUploadStatus('Upload failed');
      setShowLoginModal(false);
      setDialogState({
        isOpen: true,
        title: 'Error',
        message: 'An unexpected error occurred. Please try again later.',
        type: 'error',
      });
      setUploadProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
  };

  const handleCloseDialog = () => {
    setDialogState(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <>
      <div className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-md mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-blue-800">Before you start</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>Download our Excel template with the exact columns needed for merchant updates.</p>
                <div className="mt-2">
                  <ExcelTemplateDownload />
                </div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="excelFile" className="block text-sm font-medium text-gray-700">
              Upload Excel File
            </label>
            <div className="mt-1 flex items-center">
              <input
                id="excelFile"
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="sr-only"
                aria-label="Upload Excel file"
              />
              <label
                htmlFor="excelFile"
                className="cursor-pointer rounded-md bg-white py-2 px-3 text-sm font-medium text-gray-700 border border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Choose file
              </label>
              <span className="ml-3 text-sm text-gray-500">
                {fileName || 'No file selected'}
              </span>
              {fileName && (
                <button
                  type="button"
                  onClick={resetFileInput}
                  className="ml-2 text-sm text-red-600 hover:text-red-800"
                  aria-label="Remove file"
                >
                  Remove
                </button>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Upload the merchant-template.xlsx file with your merchant data
            </p>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || !fileName}
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Upload"
            >
              {isLoading ? 'Uploading...' : 'Upload Merchants'}
            </button>
          </div>
        </form>

        {isLoading && (
          <div className="mt-4">
            <ProgressBar 
              progress={uploadProgress} 
              status={uploadStatus}
              showRetry={retryCount > 0}
              retryCount={retryCount}
            />
          </div>
        )}

        {previewData.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700">Preview of Merchant Data</h3>
            <div className="mt-2 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300 table-fixed border">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(previewData[0]).map((key, index) => (
                      <th
                        key={key + index}
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 border-b border-r"
                        style={{ minWidth: '120px' }}
                      >
                        {key === 'merchantId' ? 'Merchant ID' :
                         key === 'incorporationDate' ? 'Incorporation Date' :
                         key === 'contactPersonName' ? 'Contact Name' :
                         key === 'contactPersonEmail' ? 'Contact Email' :
                         key === 'contactPersonPhone' ? 'Contact Phone' :
                         key === 'contactPersonRelation' ? 'Relation' :
                         key === 'companyRegistrationNumber' ? 'Company Reg #' :
                         key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {previewData.map((row, rowIndex) => {
                    const allKeys = Object.keys(previewData[0]);
                    
                    return (
                      <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        {allKeys.map((key, colIndex) => (
                          <td
                            key={`${rowIndex}-${colIndex}`}
                            className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 border-r"
                            style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis' }}
                          >
                            {key === 'incorporationDate' && row[key]
                              ? formatDateString(String(row[key]))
                              : String(row[key] || '')}
                        </td>
                      ))}
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-gray-500 italic">
              Showing {previewData.length} of {totalRowCount} row{totalRowCount !== 1 ? 's' : ''}. Verify the data looks correct before uploading.
            </p>
          </div>
        )}

        <div className="mt-4 border-t border-gray-200 pt-4">
          <h3 className="text-sm font-medium text-gray-700">Required Columns</h3>
          <p className="mt-1 text-xs text-gray-500">
            Your Excel file must include these exact columns:
          </p>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="bg-gray-50 p-3 rounded">
              <p className="font-medium text-xs text-gray-700">merchantId</p>
              <p className="text-xs text-gray-500 mt-1">Required field to identify the merchant</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="font-medium text-xs text-gray-700">incorporationDate</p>
              <p className="text-xs text-gray-500 mt-1">Date in YYYY-MM-DD format (e.g., 2020-01-01)</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="font-medium text-xs text-gray-700">contactPersonName</p>
              <p className="text-xs text-gray-500 mt-1">Full name of the contact person</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="font-medium text-xs text-gray-700">contactPersonEmail</p>
              <p className="text-xs text-gray-500 mt-1">Valid email address of the contact person</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="font-medium text-xs text-gray-700">contactPersonPhone</p>
              <p className="text-xs text-gray-500 mt-1">Phone number (e.g., 0241111111)</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="font-medium text-xs text-gray-700">contactPersonRelation</p>
              <p className="text-xs text-gray-500 mt-1">Relationship to merchant (CEO, Director, etc.)</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="font-medium text-xs text-gray-700">companyRegistrationNumber</p>
              <p className="text-xs text-gray-500 mt-1">Official company registration number (e.g., BN-12345678)</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500 italic">
            Note: Each merchantId must be a valid ID already existing in the system.
          </p>
        </div>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={handleCloseLoginModal}
        onSubmit={handleLoginSubmit}
        isLoading={isLoading}
      />

      <ResponseDialog
        isOpen={dialogState.isOpen}
        onClose={handleCloseDialog}
        title={dialogState.title}
        message={dialogState.message}
        type={dialogState.type}
        additionalAction={dialogState.additionalAction}
      />
    </>
  );
} 