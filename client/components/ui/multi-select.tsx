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
    // This part of the code adds defensive programming for undefined arrays
    const safeSelected = selected || [];
    const safeOptions = options || [];
    
    if (safeSelected.length === 0) {
      return placeholder
    }
    if (safeSelected.length === safeOptions.length) {
      return "All selected"
    }
    
    // This part of the code creates display text using the selected values with error handling
    const selectedLabels = safeSelected.map(value => {
      try {
        const option = safeOptions.find(opt => opt && getOptionValue(opt) === value);
        return option ? getOptionLabel(option) : value;
      } catch (error) {
        console.warn("Error formatting option label:", error);
        return value || "Unknown";
      }
    });
    
    if (selectedLabels.length <= maxDisplay) {
      return selectedLabels.join(", ")
    }
    return `${selectedLabels.slice(0, maxDisplay).join(", ")} +${safeSelected.length - maxDisplay} more`
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
              {(options || []).map((option, index) => {
                // This part of the code adds error handling for option processing
                try {
                  if (!option) {
                    console.warn("Undefined option at index:", index);
                    return null;
                  }
                  
                  const value = getOptionValue(option);
                  const label = getOptionLabel(option);
                  const subtext = getOptionSubtext(option);
                  const safeSelected = selected || [];
                  
                  return (
                    <CommandItem
                      key={value || `option-${index}`}
                      value={label}
                      onSelect={() => handleSelect(option)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          safeSelected.includes(value) ? "opacity-100" : "opacity-0"
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
                } catch (error) {
                  console.error("Error rendering option at index", index, ":", error);
                  return null;
                }
              }).filter(Boolean)}
            </CommandGroup>
            {(selected || []).length > 0 && (
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
      {(selected || []).length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {(selected || []).slice(0, maxDisplay * 2).map((value) => {
            try {
              const safeOptions = options || [];
              const option = safeOptions.find(opt => opt && getOptionValue(opt) === value);
              const label = option ? getOptionLabel(option) : value || "Unknown";
              
              return (
                <Badge
                  key={value || Math.random()}
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
            } catch (error) {
              console.error("Error rendering badge:", error);
              return null;
            }
          }).filter(Boolean)}
          {(selected || []).length > maxDisplay * 2 && (
            <Badge variant="outline" className="text-xs px-2 py-1">
              +{(selected || []).length - maxDisplay * 2} more
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
