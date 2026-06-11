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
API_URL=https://staging-loans-api.blupayafrica.com
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## API Endpoints

The application uses Next.js API routes as a proxy to the external API. Authentication is done via Basic Auth (username/password) provided by the user at runtime.

### Single Merchant KYC Update
- **Internal Route**: `/api/merchant/[merchantId]/kyc`
- **External API**: `POST {API_URL}/api/merchant/:merchantId/kyc`
- **Method**: POST
- **Auth**: Basic Authentication (username:password)
- **Body**:
```json
{
  "merchantId": "MERCH-001",
  "incorporationDate": "2020-01-01",
  "contactPersonName": "John Doe",
  "contactPersonEmail": "john.doe@example.com",
  "contactPersonPhone": "0241111111",
  "contactPersonRelation": "CEO",
  "companyRegistrationNumber": "BN-12345678"
}
```

### Bulk Merchant KYC Update
- **Internal Route**: `/api/merchant/bulk-kyc`
- **External API**: `POST {API_URL}/api/merchant/kyc/bulk`
- **Method**: POST
- **Auth**: Basic Authentication (username:password)
- **Body**:
```json
{
  "updates": [
    {
      "merchantId": "MERCH-001",
      "contactPersonName": "Jane Smith",
      "contactPersonPhone": "0242222222"
    },
    {
      "merchantId": "MERCH-002",
      "contactPersonName": "John Doe",
      "contactPersonEmail": "john@example.com"
    }
  ]
}
```

**Note:** Only `merchantId` is required in each update object. All other fields are optional.

## Excel Template Format

The Excel file for bulk updates should contain the following columns:

### Required Column:
- **merchantId** - Unique merchant identifier (e.g., MERCH-001)

### Optional Columns:
- incorporationDate - Date in YYYY-MM-DD format (e.g., 2020-01-01)
- contactPersonName - Full name of the contact person
- contactPersonEmail - Valid email address
- contactPersonPhone - Phone number (e.g., 0241111111)
- contactPersonRelation - Relationship to merchant (CEO, Director, etc.)
- companyRegistrationNumber - Official company registration number (e.g., BN-12345678)

You can update only the fields you need by leaving other columns empty.


## Build & Deployment

To build the application for production:
```bash
npm run build
```

## License

[MIT](LICENSE)
