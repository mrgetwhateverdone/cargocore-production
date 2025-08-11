import * as React from "react"
import { Check, ChevronDown, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

interface MultiSelectProps<T = string> {
  options: T[]
  selected: string[]
  onSelectionChange: (selected: string[]) => void
  placeholder?: string
  maxDisplay?: number
  disabled?: boolean
  getOptionValue?: (option: T) => string
  getOptionLabel?: (option: T) => string
  getOptionSubtext?: (option: T) => string
}

/**
 * This part of the code creates a multi-select dropdown component
 * Allows users to select multiple brands or warehouses for report filtering
 */
export function MultiSelect<T = string>({
  options,
  selected,
  onSelectionChange,
  placeholder = "Select items...",
  maxDisplay = 3,
  disabled = false,
  getOptionValue = (option: T) => String(option),
  getOptionLabel = (option: T) => String(option),
  getOptionSubtext = () => ""
}: MultiSelectProps<T>) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (option: T) => {
    const value = getOptionValue(option);
    if (selected.includes(value)) {
      onSelectionChange(selected.filter(item => item !== value))
    } else {
      onSelectionChange([...selected, value])
    }
  }

  const handleRemove = (value: string) => {
    onSelectionChange(selected.filter(item => item !== value))
  }

  const handleClearAll = () => {
    onSelectionChange([])
  }

  const displayText = React.useMemo(() => {
    if (selected.length === 0) {
      return placeholder
    }
    if (selected.length === options.length) {
      return "All selected"
    }
    
    // This part of the code creates display text using the selected values
    const selectedLabels = selected.map(value => {
      const option = options.find(opt => getOptionValue(opt) === value);
      return option ? getOptionLabel(option) : value;
    });
    
    if (selectedLabels.length <= maxDisplay) {
      return selectedLabels.join(", ")
    }
    return `${selectedLabels.slice(0, maxDisplay).join(", ")} +${selected.length - maxDisplay} more`
  }, [selected, options, maxDisplay, placeholder, getOptionValue, getOptionLabel])

  return (
    <div className="w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-left font-normal"
            disabled={disabled}
          >
            <span className="truncate">{displayText}</span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search..." className="h-9" />
            <CommandEmpty>No items found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {options.map((option) => {
                const value = getOptionValue(option);
                const label = getOptionLabel(option);
                const subtext = getOptionSubtext(option);
                
                return (
                  <CommandItem
                    key={value}
                    value={label}
                    onSelect={() => handleSelect(option)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selected.includes(value) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{label}</div>
                      {subtext && (
                        <div className="text-xs text-gray-500">{subtext}</div>
                      )}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selected.length > 0 && (
              <div className="border-t p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="w-full text-xs"
                >
                  Clear All
                </Button>
              </div>
            )}
          </Command>
        </PopoverContent>
      </Popover>
      
      {/* Selected items display */}
      {selected.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {selected.slice(0, maxDisplay * 2).map((value) => {
            const option = options.find(opt => getOptionValue(opt) === value);
            const label = option ? getOptionLabel(option) : value;
            
            return (
              <Badge
                key={value}
                variant="secondary"
                className="text-xs px-2 py-1"
              >
                {label}
                <X
                  className="ml-1 h-3 w-3 cursor-pointer"
                  onClick={() => handleRemove(value)}
                />
              </Badge>
            );
          })}
          {selected.length > maxDisplay * 2 && (
            <Badge variant="outline" className="text-xs px-2 py-1">
              +{selected.length - maxDisplay * 2} more
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
