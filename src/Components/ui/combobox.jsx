import * as React from "react"
import { IoCheckmark, IoChevronDown } from "react-icons/io5"

import { cn } from "../../lib/utils"
import { Button } from "./button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover"

export function ComboBox({
  options,
  value,
  onValueChange,
  placeholder = "Seleccionar...",
  searchPlaceholder = "Buscar...",
  emptyMessage = "No se encontraron resultados",
  className,
  disabled = false
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open && !disabled} onOpenChange={disabled ? () => { } : setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open && !disabled}
          disabled={disabled}
          className={cn("w-full justify-between", className)}
        >
          <span className={cn(
            "truncate text-left flex-1 mr-2",
            value !== undefined && value !== null && value !== ''
              ? "font-normal"
              : "font-normal"
          )}>
            {value !== undefined && value !== null && value !== ''
              ? options.find((option) => String(option.value) === String(value))?.label
              : placeholder}
          </span>
          <IoChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          {/* SE ESTA HABILITANDO EL INPUT DE BUSQUEDA MAYOR A 5 */}
          {options.length >= 5 && (
            <CommandInput placeholder={searchPlaceholder} />
          )}
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={`${String(option.value || '')}|${String(option.label || '')}`}
                  keywords={[String(option.value || ''), String(option.label || '')]}
                  onSelect={(currentValue) => {
                    if (disabled) return;
                    // Asegurar que currentValue sea una string antes de usar split
                    const safeValue = String(currentValue || '');
                    // Extraer el value real del string combinado
                    const realValue = safeValue.includes('|') ? safeValue.split('|')[0] : safeValue;
                    const newValue = String(realValue) === String(value) ? "" : realValue;
                    onValueChange?.(newValue);
                    setOpen(false);
                  }}
                >
                  <IoCheckmark
                    className={cn(
                      "mr-2 h-4 w-4",
                      String(value) === String(option.value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
