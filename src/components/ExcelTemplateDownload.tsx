"use client";

import { useState } from 'react';
import * as XLSX from 'xlsx';

export default function ExcelTemplateDownload() {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadTemplate = () => {
    setIsGenerating(true);

    try {
      // Column headers — must match field names expected by the API
      const headers = [
        'merchantId',
        'contactPersonName',
        'contactPersonEmail',
        'contactPersonPhone',
        'contactPersonRelation',
        'incorporationDate',
        'accountNumber',
        'legalForm',
        'accountType',
      ];

      // Create workbook and worksheet from headers
      const workbook = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([headers]);

      // Sample data rows for reference
      const data = [
        [
          '1480000493',
          'John Doe',
          'john.doe@example.com',
          '+2348012345678',
          'CEO',
          '2022-05-15',
          '0123456789',
          'private',
          'BANK_ACCOUNT',
        ],
        [
          '1480000789',
          'Jane Smith',
          'jane.smith@example.com',
          '0592345678',
          'Manager',
          '2023-01-20',
          '0987654321',
          'sole proprietor',
          'MOBILE_MONEY',
        ],
        // Empty row as a template for user data
        ['', '', '', '', '', '', '', '', ''],
      ];

      XLSX.utils.sheet_add_aoa(ws, data, { origin: 1 });

      // Column widths for readability
      ws['!cols'] = [
        { wch: 15 }, // merchantId
        { wch: 25 }, // contactPersonName
        { wch: 30 }, // contactPersonEmail
        { wch: 20 }, // contactPersonPhone
        { wch: 20 }, // contactPersonRelation
        { wch: 18 }, // incorporationDate
        { wch: 18 }, // accountNumber
        { wch: 18 }, // legalForm
        { wch: 18 }, // accountType
      ];

      // Header row height
      if (!ws['!rows']) ws['!rows'] = [];
      ws['!rows'][0] = { hpt: 25 };

      // Format the incorporationDate sample cell
      const dateCellRef = XLSX.utils.encode_cell({ r: 1, c: 5 });
      if (ws[dateCellRef]) {
        ws[dateCellRef].z = 'yyyy-mm-dd';
      }

      XLSX.utils.book_append_sheet(workbook, ws, 'MerchantData');
      XLSX.writeFile(workbook, 'merchant-template.xlsx');
    } catch (error) {
      console.error('Failed to generate template:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={handleDownloadTemplate}
        disabled={isGenerating}
        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
        aria-label="Download Excel template"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleDownloadTemplate();
          }
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        {isGenerating ? 'Generating...' : 'Download Excel Template'}
      </button>
      <p className="mt-1 text-xs text-gray-500">
        Download a template with all 9 required columns for bulk merchant updates
      </p>
    </div>
  );
}