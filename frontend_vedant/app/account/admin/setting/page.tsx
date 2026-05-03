'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import WalletSettingsTab from './WalletSettingsTab'
import TaxSettingsTab from './TaxSettingsTab'

const SettingsPage = () => {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Tabs defaultValue="wallet">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="wallet">Wallet & Rewards</TabsTrigger>
          <TabsTrigger value="tax">Tax Settings</TabsTrigger>
        </TabsList>

        {/* Wallet & Rewards Tab */}
        <TabsContent value="wallet">
          <WalletSettingsTab />
        </TabsContent>

        {/* Tax Settings Tab */}
        <TabsContent value="tax">
          <TaxSettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SettingsPage