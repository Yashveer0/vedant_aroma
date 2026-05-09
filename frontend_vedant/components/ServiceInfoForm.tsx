"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input'; // Import the Input component
import { resolveMediaUrl } from '@/lib/media';

// --- Type Definitions ---
interface ServiceItem {
    _id: string; // This is the cartItem._id
    image?: string;
    product: {
        _id: string;
        name: string;
        userInputInstructions?: string;
    };
}

interface User {
    fullName?: string;
    email?: string;
    phone?: string;
}

// A more structured state for each form instance
interface ServiceInputState {
    name: string;
    phone: string;
    email: string;
    additionalInfo: string;
}

interface ServiceInfoFormProps {
    serviceItems: ServiceItem[];
    user: User | null;
    // This prop remains the same: it will receive the final, formatted string
    onInputChange: (inputs: Record<string, string>) => void;
}

export const ServiceInfoForm: React.FC<ServiceInfoFormProps> = ({ serviceItems, user, onInputChange }) => {
    // State to hold the structured input data for each service item
    // The key is the cart item ID
    const [inputs, setInputs] = useState<Record<string, ServiceInputState>>({});

    // 1. Initialize the state for each service item form when the component mounts or props change.
    useEffect(() => {
        const initialInputs: Record<string, ServiceInputState> = {};
        serviceItems.forEach(item => {
            initialInputs[item._id] = {
                name: user?.fullName || '',
                phone: user?.phone || '',
                email: user?.email || '',
                additionalInfo: ''
            };
        });
        setInputs(initialInputs);
    }, [serviceItems, user]); // Rerun only when the items or user object change

    // 2. Whenever the structured `inputs` state changes, format it into a single string
    //    and notify the parent CheckoutPage.
    useEffect(() => {
        const formattedInputs: Record<string, string> = {};
        for (const cartItemId in inputs) {
            const currentInput = inputs[cartItemId];
            // Create a clean, readable string for the backend
            formattedInputs[cartItemId] = `Full Name: ${currentInput.name}\nPhone: ${currentInput.phone}\nEmail: ${currentInput.email}\n---\nAdditional Information:\n${currentInput.additionalInfo}`;
        }
        onInputChange(formattedInputs); // Lift the formatted state up
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inputs]); // This effect runs whenever the user types in any field

    // 3. Handle changes for any specific input field.
    const handleFieldChange = (cartItemId: string, field: keyof ServiceInputState, value: string) => {
        console.log(inputs)
        setInputs(prev => ({
            ...prev,
            [cartItemId]: {
                ...prev[cartItemId],
                [field]: value
            }
        }));
    };

    // Render nothing if there's no data yet to avoid flicker
    if (Object.keys(inputs).length === 0) {
        return null;
    }

    return (
        <div className="pt-6 border-t">
            <h2 className="text-xl font-semibold mb-6">3. Service Information</h2>
            <div className="space-y-6">
                {serviceItems.map((item) => (
                    <div key={item._id} className="p-4 border rounded-xl bg-gray-50 space-y-4">
                        {/* Service Header */}
                        <div className="flex items-start space-x-4">
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                <Image src={resolveMediaUrl(item.image)} alt={item.product.name} fill className="object-cover" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold">{item.product.name}</h4>
                                <p className="text-sm text-gray-500">Please provide the following details for this service.</p>
                            </div>
                        </div>

                        {/* Input Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor={`service-name-${item._id}`}>Full Name *</Label>
                                <Input
                                    id={`service-name-${item._id}`}
                                    value={inputs[item._id]?.name || ''}
                                    onChange={(e) => handleFieldChange(item._id, 'name', e.target.value)}
                                    placeholder="Your full name"
                                    required
                                />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor={`service-phone-${item._id}`}>Phone *</Label>
                                <Input
                                    id={`service-phone-${item._id}`}
                                    value={inputs[item._id]?.phone || ''}
                                    onChange={(e) => handleFieldChange(item._id, 'phone', e.target.value)}
                                    placeholder="Your phone number"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`service-email-${item._id}`}>Email *</Label>
                            <Input
                                id={`service-email-${item._id}`}
                                type="email"
                                value={inputs[item._id]?.email || ''}
                                onChange={(e) => handleFieldChange(item._id, 'email', e.target.value)}
                                placeholder="Your email address"
                                required
                            />
                        </div>

                        {/* Instructions & Textarea for Additional Info */}
                        {item.product.userInputInstructions && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800 whitespace-pre-wrap">
                                 <span className="font-bold">Instructions:</span> {item.product.userInputInstructions}
                            </div>
                        )}
                        <div className="space-y-2">
                             <Label htmlFor={`service-additional-${item._id}`}>Additional Information</Label>
                            <Textarea
                                id={`service-additional-${item._id}`}
                                value={inputs[item._id]?.additionalInfo || ''}
                                onChange={(e) => handleFieldChange(item._id, 'additionalInfo', e.target.value)}
                                rows={5}
                                placeholder="Enter any other required information here..."
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
