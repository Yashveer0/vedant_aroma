"use client"
import { useState, memo, useCallback, useMemo } from "react"
import { X, Filter, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { PriceRangeFilter } from "@/components/PriceRangeFilter"

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
    priceRange?: { min: number; max: number }
    onPriceChange?: (min: number, max: number) => void
    maxPrice?: number
    className?: string
    children?: React.ReactNode 
}

export const FiltersSidebar = memo(function FiltersSidebar({
    filters,
    selectedFilters,
    onFilterChange,
    onClearFilters,
    priceRange,
    onPriceChange,
    maxPrice,
    className = "",
    children, 
}: FiltersSidebarProps) {
    const [openGroups, setOpenGroups] = useState<string[]>(() => filters.map((f) => f.id))

    // Memoize callbacks to prevent re-renders
    const toggleGroup = useCallback((groupId: string) => {
        setOpenGroups((prev) => 
            prev.includes(groupId) 
                ? prev.filter((id) => id !== groupId) 
                : [...prev, groupId]
        )
    }, [])

    // Memoize expensive calculations
    const selectedCount = useMemo(() => 
        Object.values(selectedFilters).reduce((total, group) => total + group.length, 0),
        [selectedFilters]
    )

    const selectedFiltersFlat = useMemo(() => {
        const flat: Array<{ groupId: string; optionId: string; label: string }> = []
        Object.entries(selectedFilters).forEach(([groupId, options]) => {
            options.forEach((optionId) => {
                const group = filters.find((f) => f.id === groupId)
                const option = group?.options.find((o) => o.id === optionId)
                if (group && option) {
                    flat.push({ groupId, optionId, label: option.label })
                }
            })
        })
        return flat
    }, [selectedFilters, filters])

    // Memoize filter change handler
    const handleFilterChange = useCallback((groupId: string, optionId: string, checked: boolean) => {
        onFilterChange(groupId, optionId, checked)
    }, [onFilterChange])

    // Memoize clear filters handler
    const handleClearFilters = useCallback(() => {
        onClearFilters()
    }, [onClearFilters])

    const FilterContent = memo(() => (
        <div className="space-y-6">
            {/* Price Range Filter */}
            {priceRange && onPriceChange && maxPrice && (
                <div className="border-b border-gray-100 pb-4">
                    <h3 className="font-semibold text-gray-800 mb-4">Price Range</h3>
                    <PriceRangeFilter
                        initialMin={priceRange.min}
                        initialMax={priceRange.max}
                        maxPrice={maxPrice}
                        onPriceChange={onPriceChange}
                    />
                </div>
            )}
            
            {selectedCount > 0 && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3 pb-4 border-b border-gray-100"
                >
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm text-gray-800">Applied Filters</h3>
                        <Button 
                            variant="link" 
                            size="sm" 
                            onClick={handleClearFilters} 
                            className="text-red-500 hover:text-red-700 h-auto p-0 text-xs"
                        >
                            Clear All
                        </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <AnimatePresence mode="popLayout">
                            {selectedFiltersFlat.map(({ groupId, optionId, label }) => (
                                <motion.div 
                                    key={`${groupId}-${optionId}`} 
                                    layout
                                    initial={{ opacity: 0, scale: 0.8 }} 
                                    animate={{ opacity: 1, scale: 1 }} 
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Badge variant="secondary" className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-full pr-1 text-xs">
                                        {label}
                                        <button 
                                            onClick={() => handleFilterChange(groupId, optionId, false)} 
                                            className="ml-1.5 h-4 w-4 rounded-full hover:bg-gray-300 flex items-center justify-center transition-colors"
                                            aria-label={`Remove ${label} filter`}
                                        >
                                            <X className="h-2.5 w-2.5" />
                                        </button>
                                    </Badge>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </motion.div>
            )}

            {filters.map((group) => (
                <div key={group.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                    <button 
                        onClick={() => toggleGroup(group.id)} 
                        className="flex items-center justify-between w-full text-left font-semibold text-gray-800 hover:text-gray-600 transition-colors py-1"
                    >
                        <span>{group.label}</span>
                        <motion.div 
                            animate={{ rotate: openGroups.includes(group.id) ? 0 : -180 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ChevronUp className="h-4 w-4" />
                        </motion.div>
                    </button>
                    
                    <AnimatePresence>
                        {openGroups.includes(group.id) && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }} 
                                animate={{ opacity: 1, height: "auto" }} 
                                exit={{ opacity: 0, height: 0 }} 
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="overflow-hidden"
                            >
                                <div className="pt-4 space-y-3">
                                    {group.options.map((option) => {
                                        const isChecked = selectedFilters[group.id]?.includes(option.id) || false
                                        return (
                                            <div key={option.id} className="flex items-center space-x-3">
                                                <Checkbox 
                                                    id={`${group.id}-${option.id}`} 
                                                    checked={isChecked}
                                                    onCheckedChange={(checked) => handleFilterChange(group.id, option.id, checked as boolean)} 
                                                />
                                                <Label 
                                                    htmlFor={`${group.id}-${option.id}`} 
                                                    className="text-sm font-normal text-gray-600 cursor-pointer hover:text-gray-800 transition-colors"
                                                >
                                                    {option.label}
                                                </Label>
                                            </div>
                                        )
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
            
            {children}
        </div>
    ))

    return (
        <>
            {/* Desktop */}
            <aside className={`hidden lg:block w-80 flex-shrink-0 ${className}`}>
                <div className="sticky top-28 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                        {selectedCount > 0 && (
                            <p className="text-sm text-gray-500 mt-1">
                                {selectedCount} filter{selectedCount !== 1 ? 's' : ''} applied
                            </p>
                        )}
                    </div>
                    <div className="p-6">
                        <FilterContent />
                    </div>
                </div>
            </aside>

            {/* Mobile */}
            <div className="lg:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="w-full mb-4 h-12 rounded-xl border-gray-200">
                            <Filter className="h-4 w-4 mr-2" />
                            Filters {selectedCount > 0 && (
                                <Badge variant="secondary" className="ml-2 bg-gray-100">
                                    {selectedCount}
                                </Badge>
                            )}
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80 p-0">
                        <SheetHeader className="p-6 border-b border-gray-100 bg-gray-50/50">
                            <SheetTitle className="text-xl font-bold text-gray-900">Filters</SheetTitle>
                            {selectedCount > 0 && (
                                <p className="text-sm text-gray-500 text-left">
                                    {selectedCount} filter{selectedCount !== 1 ? 's' : ''} applied
                                </p>
                            )}
                        </SheetHeader>
                        <div className="p-6">
                            <FilterContent />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </>
    )
})