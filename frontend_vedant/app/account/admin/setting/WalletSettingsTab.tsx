'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Edit2, Save, X, PlusCircle, Trash2, Loader2 } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '@/lib/redux/store'
import { fetchWalletConfig, updateWalletConfig } from '@/lib/redux/slices/adminSlice'
import { RewardRule } from '@/lib/api/admin'
import { toast } from 'sonner'

type TempRule = Partial<RewardRule> & { id: number };

const RedeemSettingsPage = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { walletConfig, walletConfigStatus } = useSelector((state: RootState) => state.admin)
  
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [tempRules, setTempRules] = useState<TempRule[]>([])
  const [tempPointValue, setTempPointValue] = useState(1)

  useEffect(() => {
    dispatch(fetchWalletConfig())
  }, [dispatch])

  const setEditingState = () => {
    if (walletConfig) {
      setTempRules(walletConfig.rewardRules.map((rule, index) => ({ ...rule, id: index })))
      setTempPointValue(walletConfig.rupeesPerPoint)
    }
  }

  useEffect(() => { setEditingState() }, [walletConfig])

  const handleEdit = () => { setEditingState(); setIsEditing(true); }
  const handleCancel = () => { setEditingState(); setIsEditing(false); }

  const handleSave = async () => {
    setIsSaving(true);
    const finalRules: RewardRule[] = tempRules
      .filter(rule => rule.minSpend && rule.pointsAwarded)
      .map(({ id, ...rest }) => rest as RewardRule);

    const configData = {
      rewardRules: finalRules,
      rupeesPerPoint: tempPointValue,
    }

    try {
      await dispatch(updateWalletConfig(configData)).unwrap();
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  }

  const handleRuleChange = (id: number, field: keyof RewardRule, value: string) => {
    setTempRules(prevRules => 
      prevRules.map(rule => 
        rule.id === id ? { ...rule, [field]: parseInt(value) || 0 } : rule
      )
    )
  }

  const addRule = () => { setTempRules(prev => [...prev, { id: Date.now() }]) }
  const deleteRule = (id: number) => { setTempRules(prev => prev.filter(rule => rule.id !== id)) }

  if (walletConfigStatus === 'loading') {
      return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Wallet & Reward Settings</CardTitle>
              <CardDescription>Configure how users earn and redeem loyalty points.</CardDescription>
            </div>
            {!isEditing && <Button onClick={handleEdit}><Edit2 className="w-4 h-4 mr-2" />Edit Settings</Button>}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="rupeesPerPoint" className="font-semibold text-lg">Point Value</Label>
            <Input id="rupeesPerPoint" type="number" step="0.01" value={isEditing ? tempPointValue : walletConfig?.rupeesPerPoint} onChange={e => setTempPointValue(parseFloat(e.target.value) || 0)} disabled={!isEditing} className="max-w-xs"/>
            <p className="text-sm text-muted-foreground">The value of 1 point in Rupees.</p>
          </div>
          
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <Label className="font-semibold text-lg">Reward Rules (Milestones)</Label>
              {/* {isEditing && <Button type="button" size="sm" variant="outline" onClick={addRule}><PlusCircle className="w-4 h-4 mr-2"/>Add Rule</Button>} */}
            </div>
            <p className="text-sm text-muted-foreground">Set spending thresholds. The highest applicable rule will be applied.</p>
            <div className="space-y-3">
              {isEditing ? (
                tempRules.map((rule) => (
                  <div key={rule.id} className="flex items-center gap-4 p-2 border rounded-md">
                    <Input type="number" placeholder="Min Spend (₹)" value={rule.minSpend || ''} onChange={e => handleRuleChange(rule.id, 'minSpend', e.target.value)} />
                    <span>⮕</span>
                    <Input type="number" placeholder="Points Awarded" value={rule.pointsAwarded || ''} onChange={e => handleRuleChange(rule.id, 'pointsAwarded', e.target.value)} />
                    {/* <Button type="button" variant="ghost" size="icon" onClick={() => deleteRule(rule.id)}><Trash2 className="w-4 h-4 text-red-500"/></Button> */}
                  </div>
                ))
              ) : (
                walletConfig?.rewardRules.map((rule, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                    <span className="font-mono">Spend over <span className="font-semibold">₹{rule.minSpend}</span>, get <span className="font-semibold">{rule.pointsAwarded}</span> points.</span>
                  </div>
                ))
              )}
               {(!isEditing && walletConfig?.rewardRules.length === 0) && <p className="text-sm text-center text-muted-foreground py-4">No reward rules have been set.</p>}
            </div>
          </div>
          
          {isEditing && (
            <div className="flex gap-3 pt-4 border-t">
              <Button onClick={handleSave} disabled={isSaving}><Loader2 className={`mr-2 h-4 w-4 animate-spin ${!isSaving && 'hidden'}`}/>Save Changes</Button>
              <Button onClick={handleCancel} variant="outline">Cancel</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default RedeemSettingsPage;