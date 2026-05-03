// src/components/DecorFiltersSidebar.tsx
"use client"

import { useState } from "react"
import { X, Filter, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"

interface FilterOption {
    id: string
    label: string
}

interface FilterGroup {
    id: string
    label: string
    options: FilterOption[]
}

interface FiltersSidebarProps {
    filters: FilterGroup[]
    selectedFilters: Record<string, string[]>
    onFilterChange: (groupId: string, optionId: string, checked: boolean) => void
    onClearFilters: () => void
    className?: string
}

// Renamed to be more specific, but the logic is reusable
export function DecorFiltersSidebar({
    filters,
    selectedFilters,
    onFilterChange,
    onClearFilters,
    className = "",
}: FiltersSidebarProps) {
    const [openGroups, setOpenGroups] = useState<string[]>(filters.map((f) => f.id))

    const toggleGroup = (groupId: string) => {
        setOpenGroups((prev) => (prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]))
    }

    const getSelectedCount = () => Object.values(selectedFilters).reduce((total, group) => total + group.length, 0);

    const getSelectedFiltersFlat = () => {
        const flat: Array<{ groupId: string; optionId: string; label: string }> = []
        Object.entries(selectedFilters).forEach(([groupId, options]) => {
            options.forEach((optionId) => {
                const group = filters.find((f) => f.id === groupId)
                const option = group?.options.find((o) => o.id === optionId)
                if (group && option) flat.push({ groupId, optionId, label: option.label })
            })
        })
        return flat
    }

    const FilterContent = () => (
        <div className="space-y-6">
            {getSelectedCount() > 0 && (
                <div className="space-y-3 pb-4 border-b">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm">Applied Filters</h3>
                        <Button variant="link" size="sm" onClick={onClearFilters} className="text-red-500 hover:text-red-700 h-auto p-0">
                            Clear All
                        </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <AnimatePresence>
                            {getSelectedFiltersFlat().map(({ groupId, optionId, label }) => (
                                <motion.div key={`${groupId}-${optionId}`} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                                    <Badge variant="secondary" className="bg-gray-200 text-gray-800 font-medium rounded-full pr-1">
                                        {label}
                                        <button onClick={() => onFilterChange(groupId, optionId, false)} className="ml-1.5 h-4 w-4 rounded-full hover:bg-gray-300 flex items-center justify-center">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            )}
            {filters.map((group) => (
                <div key={group.id} className="border-b pb-4">
                    <button onClick={() => toggleGroup(group.id)} className="flex items-center justify-between w-full text-left font-semibold">
                        {group.label}
                        <motion.div animate={{ rotate: openGroups.includes(group.id) ? 0 : -180 }}><ChevronUp className="h-4 w-4" /></motion.div>
                    </button>
                    <AnimatePresence>
                        {openGroups.includes(group.id) && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="pt-4 space-y-3 overflow-hidden">
                                {group.options.map((option) => (
                                    <div key={option.id} className="flex items-center space-x-3">
                                        <Checkbox id={`${group.id}-${option.id}`} checked={selectedFilters[group.id]?.includes(option.id) || false} onCheckedChange={(checked) => onFilterChange(group.id, option.id, checked as boolean)} />
                                        <Label htmlFor={`${group.id}-${option.id}`} className="text-sm font-normal text-gray-600 cursor-pointer">{option.label}</Label>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    )

    return (
        <>
            {/* Desktop */}
            <aside className={`hidden lg:block w-72 flex-shrink-0 ${className}`}>
                <div className="sticky top-28 p-6 rounded-xl border bg-white shadow-sm">
                    <h2 className="text-xl font-serif font-bold mb-6">Filters</h2>
                    <FilterContent />
                </div>
            </aside>
            {/* Mobile */}
            <div className="lg:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="w-full mb-4">
                            <Filter className="h-4 w-4 mr-2" />
                            Filters {getSelectedCount() > 0 && `(${getSelectedCount()})`}
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80">
                        <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
                        <div className="mt-6"><FilterContent /></div>
                    </SheetContent>
                </Sheet>
            </div>
        </>
    )
}