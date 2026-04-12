"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { MerchantData, DialogState } from '../types';
import { updateMerchant } from '../api/merchant';
import ResponseDialog from './ResponseDialog';

const schema = yup.object({
  merchantId: yup.string().required('Merchant ID is required'),
  contactPersonName: yup.string().required('Contact person name is required'),
  contactPersonEmail: yup.string().email('Invalid email').required('Contact person email is required'),
  contactPersonPhone: yup
    .string()
    .required('Contact person phone is required')
    .matches(/^[+]?[\d\s\-().]{7,20}$/, 'Invalid phone number format'),
  contactPersonRelation: yup.string().required('Contact person relation is required'),
  incorporationDate: yup
    .string()
    .required('Incorporation date is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
}).required();

type FormData = MerchantData & {
  merchantId: string;
};

export default function SingleUploadForm() {
  const [isLoading, setIsLoading] = useState(false);
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
      contactPersonName: '',
      contactPersonEmail: '',
      contactPersonPhone: '',
      contactPersonRelation: '',
      incorporationDate: '',
    },
  });

  const handleFormSubmit = async (data: FormData) => {
    setIsLoading(true);
    
    try {
      const { merchantId, ...merchantData } = data;
      const response = await updateMerchant(merchantId, merchantData);
      
      if (response.success) {
        setDialogState({
          isOpen: true,
          title: 'Update Successful',
          message: `Merchant ${merchantId} was successfully updated.`,
          type: 'success',
          additionalAction: {
            label: 'Update Another',
            onClick: () => {
              reset();
            }
          }
        });
      } else {
        setDialogState({
          isOpen: true,
          title: 'Update Failed',
          message: response.message || 'Failed to update merchant. Please try again.',
          type: 'error',
        });
      }
    } catch {
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
            aria-label="Merchant ID"
            placeholder="Enter merchant ID"
          />
          {errors.merchantId && (
            <p className="mt-1 text-sm text-red-600 font-medium">{errors.merchantId.message}</p>
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
            aria-label="Contact Person Name"
            placeholder="Enter contact person name"
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
            aria-label="Contact Person Email"
            placeholder="example@email.com"
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
            aria-label="Contact Person Phone"
            placeholder="Enter phone number"
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
            aria-label="Contact Person Relation"
            placeholder="e.g., CEO, Manager, etc."
          />
          {errors.contactPersonRelation && (
            <p className="mt-1 text-sm text-red-600 font-medium">{errors.contactPersonRelation.message}</p>
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
            aria-label="Incorporation Date"
          />
          {errors.incorporationDate && (
            <p className="mt-1 text-sm text-red-600 font-medium">{errors.incorporationDate.message}</p>
          )}
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            aria-label="Submit"
          >
            {isLoading ? 'Updating...' : 'Update Merchant'}
          </button>
        </div>
      </form>

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