// src/components/InvoiceTemplate.tsx

import React from 'react';
import Image from 'next/image';
import type { Order } from '@/lib/redux/slices/orderSlice';

interface InvoiceTemplateProps {
  order: Order;
  forwardedRef: React.Ref<HTMLDivElement>;
}

export const InvoiceTemplate = ({ order, forwardedRef }: InvoiceTemplateProps) => {
  // Your company details
  const companyDetails = {
    name: 'vedantgurukularoma',
    address: '123 Jewellery Lane, Mumbai, Maharashtra',
    gstin: '27ABCDE1234F1Z5',
    contact: '+91 98765 43210',
    email: 'support@vedantgurukularoma.com',
    website: 'www.vedantgurukularoma.org',
    logo: '/vedantgurukularoma' // Make sure this logo exists in your /public folder
  };

  return (
    // We keep the invoice off-screen until it's time to generate the PDF
    <div className="absolute -left-[9999px] top-0 w-[800px] bg-white p-4 font-sans" ref={forwardedRef}>
        {/* Header */}
        <div className="flex items-center justify-between bg-purple-800 text-white p-8">
            <div className="w-48">
                <Image src={companyDetails.logo} alt="vedantgurukularoma Logo" width={160} height={45} className="brightness-0 invert"/>
            </div>
            <h1 className="text-5xl font-bold tracking-wider">INVOICE</h1>
        </div>

        {/* Company & Billing Info */}
        <div className="grid grid-cols-2 gap-8 p-8 text-sm">
            <div>
                <h2 className="font-bold text-lg mb-2">{companyDetails.name}</h2>
                <p>{companyDetails.address}</p>
                <p>GSTIN: {companyDetails.gstin}</p>
                <p>Contact: {companyDetails.contact}</p>
                <p>Website: {companyDetails.website}</p>
            </div>
            <div className="text-right">
                <p><span className="font-bold">Invoice #:</span> {order._id.slice(-8).toUpperCase()}</p>
                <p><span className="font-bold">Order Date:</span> {new Date(order.createdAt).toLocaleDateString()}</p>
                <p><span className="font-bold">Status:</span> {order.orderStatus}</p>
            </div>
        </div>
        
        <div className="p-8 text-sm">
            <h3 className="font-bold mb-2">Billed To:</h3>
            <p>{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.street}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}</p>
            <p>India</p>
        </div>

        {/* Items Table */}
        <div className="p-8">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-purple-800 text-white">
                        <th className="p-3 text-left w-12">#</th>
                        <th className="p-3 text-left">Product</th>
                        <th className="p-3 text-right">Qty x Price</th>
                        <th className="p-3 text-right">Total (INR)</th>
                    </tr>
                </thead>
                <tbody>
                    {order.orderItems.map((item, index) => (
                        <tr key={index} className="border-b">
                            <td className="p-3">{index + 1}</td>
                            <td className="p-3">{item.name}</td>
                            <td className="p-3 text-right">{item.quantity} x ₹{item.price.toLocaleString()}</td>
                            <td className="p-3 text-right">₹{(item.quantity * item.price).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* Totals Section */}
        <div className="grid grid-cols-2 p-8">
            <div className="text-sm text-gray-600">
                <p className="font-bold mb-2">Note:</p>
                <p>This is a computer-generated invoice.</p>
                <p>For support, contact us at {companyDetails.contact} or email {companyDetails.email}</p>
            </div>
            <div className="text-right space-y-2">
                <p><span className="font-semibold">Subtotal:</span> ₹{order.itemsPrice.toLocaleString()}</p>
                <p><span className="font-semibold">Shipping Charges:</span> ₹{order.shippingPrice.toLocaleString()}</p>
                <p><span className="font-semibold">Tax (Included):</span> ₹{order.taxPrice.toLocaleString()}</p>
                <p className="font-bold text-lg mt-2"><span className="font-bold">Grand Total:</span> ₹{order.totalPrice.toLocaleString()}</p>
            </div>
        </div>

        {/* Footer */}
        <div className="text-center p-8 mt-8">
            <p className="font-bold text-purple-800">Thank you for your business!</p>
            <p className="text-sm text-gray-500">{companyDetails.website}</p>
        </div>
    </div>
  );
};