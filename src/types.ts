export interface MerchantData {
  contactPersonName: string;
  contactPersonEmail: string;
  contactPersonPhone: string;
  contactPersonRelation: string;
  incorporationDate: string;
  accountNumber: string;
  legalForm: string;   // see LEGAL_FORMS for valid values
  accountType: string; // see ACCOUNT_TYPES for valid values
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
  statusCode?: number;
  errors?: Array<{ message: string; [key: string]: unknown }>;
  status?: number;
}

/** Shared modal state used by SingleUploadForm and MultipleUploadForm */
export type DialogState = {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'success' | 'error';
  additionalAction?: {
    label: string;
    onClick: () => void;
  };
};

/** Valid values for the legalForm field */
export const LEGAL_FORMS = ['private', 'public', 'sole proprietor'] as const;
export type LegalForm = typeof LEGAL_FORMS[number];

/** Valid values for the accountType field */
export const ACCOUNT_TYPES = ['MOBILE_MONEY', 'BANK_ACCOUNT'] as const;
export type AccountType = typeof ACCOUNT_TYPES[number];

/** Human-readable labels for accountType values */
export const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  MOBILE_MONEY: 'Mobile Money',
  BANK_ACCOUNT: 'Bank Account',
};