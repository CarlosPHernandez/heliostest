'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

interface OrderDetails {
  productName: string;
  panelCount: number;
  pricePerPanel: number;
  totalAmount: number;
}

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      setError('No session ID found');
      setLoading(false);
      return;
    }

    const fetchSession = async () => {
      try {
        const response = await fetch('/api/get-session?session_id=' + sessionId);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch session');
        }

        setOrderDetails({
          productName: data.metadata.productName,
          panelCount: parseInt(data.metadata.panelCount),
          pricePerPanel: parseFloat(data.metadata.pricePerPanel),
          totalAmount: parseFloat(data.metadata.totalAmount)
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/shop" className="text-blue-500 hover:text-blue-700">
            Return to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Payment Successful!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Thank you for choosing our solar panel cleaning service.
          </p>
        </div>

        {orderDetails && (
          <div className="mt-8 space-y-6">
            <div className="border-t border-gray-200 pt-6">
              <dl className="space-y-4">
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Service Plan</dt>
                  <dd className="text-sm font-medium text-gray-900">{orderDetails.productName}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Number of Panels</dt>
                  <dd className="text-sm font-medium text-gray-900">{orderDetails.panelCount}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Price per Panel</dt>
                  <dd className="text-sm font-medium text-gray-900">${orderDetails.pricePerPanel}</dd>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-4">
                  <dt className="text-base font-medium text-gray-900">Total Amount</dt>
                  <dd className="text-base font-medium text-gray-900">${orderDetails.totalAmount}</dd>
                </div>
              </dl>
            </div>

            <div className="text-sm text-gray-500">
              <p>We will contact you shortly to schedule your cleaning service.</p>
              <p className="mt-2">
                If you have any questions, please don't hesitate to{' '}
                <Link href="/contact" className="text-blue-500 hover:text-blue-700">
                  contact us
                </Link>
                .
              </p>
            </div>
          </div>
        )}

        <div className="mt-6">
          <Link
            href="/shop"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Return to Shop
          </Link>
        </div>
      </div>
    </div>
  );
} 