"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { MerchantData, DialogState, AuthCredentials } from '../types';
import { updateMerchant } from '../lib/apiClient';
import ResponseDialog from './ResponseDialog';
import LoginModal from './LoginModal';

const schema = yup.object({
  merchantId: yup.string().required('Merchant ID is required'),
  incorporationDate: yup
    .string()
    .required('Incorporation date is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  contactPersonName: yup.string().required('Contact person name is required'),
  contactPersonEmail: yup.string().email('Invalid email').required('Contact person email is required'),
  contactPersonPhone: yup
    .string()
    .required('Contact person phone is required')
    .matches(/^[+]?[\d\s\-().]{7,20}$/, 'Invalid phone number format'),
  contactPersonRelation: yup.string().required('Contact person relation is required'),
  companyRegistrationNumber: yup.string().required('Company registration number is required'),
  ghanaCardId: yup.string().required('Ghana Card ID is required'),
}).required();

type FormData = MerchantData & {
  merchantId: string;
};

export default function SingleUploadForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);
  const [dialogState, setDialogState] = useState<DialogState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'success',
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      merchantId: '',
      incorporationDate: '',
      contactPersonName: '',
      contactPersonEmail: '',
      contactPersonPhone: '',
      contactPersonRelation: '',
      companyRegistrationNumber: '',
      ghanaCardId: '',
    },
  });

  const handleFormSubmit = async (data: FormData) => {
    setPendingFormData(data);
    setShowLoginModal(true);
  };

  const handleLoginSubmit = async (credentials: AuthCredentials) => {
    if (!pendingFormData) return;

    setIsLoading(true);
    
    try {
      const { merchantId, ...merchantData } = pendingFormData;
      const response = await updateMerchant(merchantId, merchantData, credentials);
      
      if (response.success) {
        setShowLoginModal(false);
        setDialogState({
          isOpen: true,
          title: 'Update Successful',
          message: `Merchant ${merchantId} was successfully updated.`,
          type: 'success',
          additionalAction: {
            label: 'Update Another',
            onClick: () => {
              reset();
              setPendingFormData(null);
            }
          }
        });
      } else {
        setShowLoginModal(false);
        setDialogState({
          isOpen: true,
          title: 'Update Failed',
          message: response.message || 'Failed to update merchant. Please try again.',
          type: 'error',
        });
      }
    } catch {
      setShowLoginModal(false);
      setDialogState({
        isOpen: true,
        title: 'Error',
        message: 'An unexpected error occurred. Please try again later.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setDialogState(prev => ({ ...prev, isOpen: false }));
  };

  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
    setPendingFormData(null);
  };

  return (
    <>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div>
          <label htmlFor="merchantId" className="block text-sm font-semibold text-gray-800">
            Merchant ID
          </label>
          <input
            id="merchantId"
            type="text"
            {...register('merchantId')}
            className="mt-1 block w-full px-4 py-3 text-gray-900 font-medium bg-white rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-30"
            placeholder="Enter merchant ID"
          />
          {errors.merchantId && (
            <p className="mt-1 text-sm text-red-600 font-medium">{errors.merchantId.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="incorporationDate" className="block text-sm font-semibold text-gray-800">
            Incorporation Date
          </label>
          <input
            id="incorporationDate"
            type="date"
            {...register('incorporationDate')}
            className="mt-1 block w-full px-4 py-3 text-gray-900 font-medium bg-white rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-30"
          />
          {errors.incorporationDate && (
            <p className="mt-1 text-sm text-red-600 font-medium">{errors.incorporationDate.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="contactPersonName" className="block text-sm font-semibold text-gray-800">
            Contact Person Name
          </label>
          <input
            id="contactPersonName"
            type="text"
            {...register('contactPersonName')}
            className="mt-1 block w-full px-4 py-3 text-gray-900 font-medium bg-white rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-30"
            placeholder="John Doe"
          />
          {errors.contactPersonName && (
            <p className="mt-1 text-sm text-red-600 font-medium">{errors.contactPersonName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="contactPersonEmail" className="block text-sm font-semibold text-gray-800">
            Contact Person Email
          </label>
          <input
            id="contactPersonEmail"
            type="email"
            {...register('contactPersonEmail')}
            className="mt-1 block w-full px-4 py-3 text-gray-900 font-medium bg-white rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-30"
            placeholder="john.doe@example.com"
          />
          {errors.contactPersonEmail && (
            <p className="mt-1 text-sm text-red-600 font-medium">{errors.contactPersonEmail.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="contactPersonPhone" className="block text-sm font-semibold text-gray-800">
            Contact Person Phone
          </label>
          <input
            id="contactPersonPhone"
            type="text"
            {...register('contactPersonPhone')}
            className="mt-1 block w-full px-4 py-3 text-gray-900 font-medium bg-white rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-30"
            placeholder="0241111111"
          />
          {errors.contactPersonPhone && (
            <p className="mt-1 text-sm text-red-600 font-medium">{errors.contactPersonPhone.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="contactPersonRelation" className="block text-sm font-semibold text-gray-800">
            Contact Person Relation
          </label>
          <input
            id="contactPersonRelation"
            type="text"
            {...register('contactPersonRelation')}
            className="mt-1 block w-full px-4 py-3 text-gray-900 font-medium bg-white rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-30"
            placeholder="CEO"
          />
          {errors.contactPersonRelation && (
            <p className="mt-1 text-sm text-red-600 font-medium">{errors.contactPersonRelation.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="companyRegistrationNumber" className="block text-sm font-semibold text-gray-800">
            Company Registration Number
          </label>
          <input
            id="companyRegistrationNumber"
            type="text"
            {...register('companyRegistrationNumber')}
            className="mt-1 block w-full px-4 py-3 text-gray-900 font-medium bg-white rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-30"
            placeholder="BN-12345678"
          />
          {errors.companyRegistrationNumber && (
            <p className="mt-1 text-sm text-red-600 font-medium">{errors.companyRegistrationNumber.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="ghanaCardId" className="block text-sm font-semibold text-gray-800">
            Ghana Card ID
          </label>
          <input
            id="ghanaCardId"
            type="text"
            {...register('ghanaCardId')}
            className="mt-1 block w-full px-4 py-3 text-gray-900 font-medium bg-white rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-30"
            placeholder="GHA-999"
          />
          {errors.ghanaCardId && (
            <p className="mt-1 text-sm text-red-600 font-medium">{errors.ghanaCardId.message}</p>
          )}
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Update Merchant
          </button>
        </div>
      </form>

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
