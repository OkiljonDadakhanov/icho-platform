"use client"

import * as React from "react"
import { Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface NumberStepperProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  disabled?: boolean
  className?: string
}

export function NumberStepper({
  value,
  onChange,
  min = 0,
  max,
  disabled = false,
  className,
}: NumberStepperProps) {
  // Store onChange in a ref to avoid dependency issues
  const onChangeRef = React.useRef(onChange)
  onChangeRef.current = onChange

  // Clamp value to valid range on mount or when max changes
  React.useEffect(() => {
    if (max !== undefined && value > max) {
      onChangeRef.current(max)
    } else if (value < min) {
      onChangeRef.current(min)
    }
  }, [max, min, value])

  const displayValue = max !== undefined ? Math.min(value, max) : value
  const canDecrement = displayValue > min
  const canIncrement = max === undefined || displayValue < max

  const handleDecrement = () => {
    if (canDecrement && !disabled) {
      onChange(displayValue - 1)
    }
  }

  const handleIncrement = () => {
    if (canIncrement && !disabled) {
      onChange(displayValue + 1)
    }
  }

  return (
    <div className={cn("inline-flex items-center rounded-lg border border-gray-200 bg-gray-50 overflow-hidden", className)}>
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || !canDecrement}
        className={cn(
          "flex items-center justify-center w-10 h-10 transition-colors duration-150",
          "focus:outline-none focus:bg-gray-200",
          canDecrement && !disabled
            ? "text-gray-700 hover:bg-gray-200 active:bg-gray-300"
            : "text-gray-300 cursor-not-allowed"
        )}
      >
        <Minus className="w-4 h-4" />
      </button>

      <div className={cn(
        "flex items-center justify-center w-14 h-10 bg-white border-x border-gray-200 font-semibold text-base",
        disabled ? "text-gray-400" : "text-gray-900"
      )}>
        {displayValue}
      </div>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || !canIncrement}
        className={cn(
          "flex items-center justify-center w-10 h-10 transition-colors duration-150",
          "focus:outline-none focus:bg-gray-200",
          canIncrement && !disabled
            ? "text-gray-700 hover:bg-gray-200 active:bg-gray-300"
            : "text-gray-300 cursor-not-allowed"
        )}
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  )
}
