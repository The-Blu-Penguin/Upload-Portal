# Merchant Upload Portal

A React application for updating merchant information individually or in bulk using an Excel spreadsheet.

## Features

- **Dual Upload Modes:**
  - Single merchant KYC update via form
  - Bulk merchant updates via Excel file upload
- **Authentication:** Secure Basic Auth login per operation
- **Data Validation:** Client-side validation with Yup schemas
- **Excel Processing:** Parse and validate Excel files with preview
- **Progress Tracking:** Real-time upload progress with retry indicators
- **Retry Logic:** Automatic retry with exponential backoff for failed requests
- **Responsive Design:** Mobile-friendly interface with Tailwind CSS

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Forms | React Hook Form + Yup |
| Excel | XLSX.js |
| HTTP | Native Fetch API |
| UI Components | Headless UI + Hero Icons |
| Notifications | React Hot Toast |

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd upload-portal
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:
```
NEXT_PUBLIC_API_URL=<your-api-url>
NEXT_PUBLIC_API_KEY=<your-api-key>
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## API Endpoints

The application communicates with the following API endpoints:

### Single Merchant Update
- **URL**: `{API_URL}/merchant/update/:merchantId`
- **Method**: PUT
- **Auth**: Bearer token (API Key)
- **Body**:
```json
{
  "contactPersonName": "",
  "contactPersonEmail": "",
  "contactPersonPhone": "",
  "contactPersonRelation": "",
  "incorporationDate": ""
}
```

### Multiple Merchants Update
- **URL**: `{API_URL}/merchant/update-multiple`
- **Method**: POST
- **Auth**: Bearer token (API Key)
- **Body**: Excel file (multipart/form-data)

## Excel Template Format

The Excel file for bulk updates should contain the following columns:
- merchantId
- contactPersonName
- contactPersonEmail
- contactPersonPhone
- contactPersonRelation
- incorporationDate (YYYY-MM-DD format)


## Build & Deployment

To build the application for production:
```bash
npm run build
```

## License

[MIT](LICENSE)
