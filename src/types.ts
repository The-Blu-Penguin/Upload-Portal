export interface MerchantData {
  contactPersonName: string;
  contactPersonEmail: string;
  contactPersonPhone: string;
  contactPersonRelation: string;
  incorporationDate: string;
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