'use client'
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Edit2, Loader2 } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '@/lib/redux/store'
import { fetchTaxConfig, updateTaxConfig } from '@/lib/redux/slices/adminSlice'

const TaxSettingsTab = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { taxConfig, taxConfigStatus } = useSelector((state: RootState) => state.admin)

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  // This state will now hold the tax rate as a whole number percentage (e.g., 7)
  const [tempTaxRate, setTempTaxRate] = useState(0)

  useEffect(() => {
    if (taxConfigStatus === 'idle') {
      dispatch(fetchTaxConfig())
    }
  }, [dispatch, taxConfigStatus])

  // Convert decimal to percentage when setting state from redux store
  useEffect(() => {
    if (taxConfig) {
      setTempTaxRate(taxConfig.rate * 100)
      console.log(tempTaxRate)
    }
  }, [taxConfig])

  const handleEdit = () => setIsEditing(true)

  // Ensure cancel resets to the correct percentage value
  const handleCancel = () => {
    if (taxConfig) {
      setTempTaxRate(taxConfig.rate * 100)
    }
    setIsEditing(false)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Send the percentage value directly from the state.
      // The backend is responsible for converting it to a decimal.
      await dispatch(updateTaxConfig(tempTaxRate)).unwrap() 
      setIsEditing(false)
    } finally {
      setIsSaving(false)
    }
}

  if (taxConfigStatus === 'loading') {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Tax Settings</CardTitle>
            <CardDescription>Configure the applicable tax rate for transactions.</CardDescription>
          </div>
          {!isEditing && <Button onClick={handleEdit}><Edit2 className="w-4 h-4 mr-2" />Edit Rate</Button>}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="taxRate" className="font-semibold text-lg">Tax Rate (%)</Label>
          <Input
            id="taxRate"
            type="number"
            step="0.01"
            // Display the value from state if editing, otherwise convert the stored decimal for display
            value={isEditing ? tempTaxRate : (taxConfig?.rate ?? 0) * 100}
            onChange={e => setTempTaxRate(parseFloat(e.target.value) || 0)}
            disabled={!isEditing}
            className="max-w-xs"
          />
          <p className="text-sm text-muted-foreground">The tax rate applied to all relevant transactions.</p>
        </div>

        {isEditing && (
          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={handleSave} disabled={isSaving}>
              <Loader2 className={`mr-2 h-4 w-4 animate-spin ${!isSaving && 'hidden'}`} />
              Save Changes
            </Button>
            <Button onClick={handleCancel} variant="outline">Cancel</Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default TaxSettingsTab