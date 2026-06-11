export interface MerchantData {
  incorporationDate: string;
  contactPersonName: string;
  contactPersonEmail: string;
  contactPersonPhone: string;
  contactPersonRelation: string;
  companyRegistrationNumber: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
  statusCode?: number;
  errors?: Array<{ message: string; [key: string]: unknown }>;
  status?: number;
}

/** Authentication credentials */
export interface AuthCredentials {
  username: string;
  password: string;
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

