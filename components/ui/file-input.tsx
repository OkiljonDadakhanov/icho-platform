import * as React from 'react'
import { cn } from '@/lib/utils'
import { Upload } from 'lucide-react'

interface FileInputProps extends Omit<React.ComponentProps<'input'>, 'type'> {
  onFileChange?: (file: File | null) => void
}

function FileInput({ className, onChange, onFileChange, disabled, accept, ...props }: FileInputProps) {
  const [fileName, setFileName] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFileName(file?.name || null)
    onFileChange?.(file)
    onChange?.(e)
  }

  return (
    <div className={cn("relative", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        disabled={disabled}
        className="sr-only"
        {...props}
      />
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={cn(
          "flex items-center w-full h-9 rounded-md border bg-transparent text-sm transition-colors",
          "border-input shadow-xs",
          "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring",
          disabled && "pointer-events-none cursor-not-allowed opacity-50"
        )}
      >
        <span className={cn(
          "inline-flex items-center gap-1.5 px-3 h-full border-r border-input bg-muted/50 rounded-l-md text-muted-foreground",
          "hover:bg-muted hover:text-foreground transition-colors",
          disabled && "hover:bg-muted/50 hover:text-muted-foreground"
        )}>
          <Upload className="w-3.5 h-3.5" />
          Choose file
        </span>
        <span className={cn(
          "flex-1 px-3 text-left truncate",
          fileName ? "text-foreground" : "text-muted-foreground"
        )}>
          {fileName || "No file chosen"}
        </span>
      </button>
    </div>
  )
}

export { FileInput }
