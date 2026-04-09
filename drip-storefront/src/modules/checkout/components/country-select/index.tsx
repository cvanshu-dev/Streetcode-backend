import { forwardRef, useImperativeHandle, useEffect, useRef } from "react"
import { HttpTypes } from "@medusajs/types"

type CountrySelectProps = {
  region?: HttpTypes.StoreRegion
  name?: string
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
  [key: string]: any
}

const CountrySelect = forwardRef<HTMLSelectElement, CountrySelectProps>(
  ({ region, onChange, name, ...props }, ref) => {
    const innerRef = useRef<HTMLSelectElement>(null)

    useImperativeHandle(ref, () => innerRef.current!)

    // Auto-fire onChange with "in" on mount so form state is always set
    useEffect(() => {
      if (onChange) {
        const event = {
          target: {
            name: name || "shipping_address.country_code",
            value: "in",
          },
        } as React.ChangeEvent<HTMLSelectElement>
        onChange(event)
      }
    }, [])

    return (
      <div className="flex flex-col w-full">
        {/* Static label matching other Input fields */}
        <label className="text-xsmall-regular uppercase text-gray-500 mb-1">
          Country
        </label>

        {/* Visual display — looks like a disabled input */}
        <div className="flex items-center w-full h-11 px-3 border border-gray-200 rounded-md bg-gray-50 text-gray-700 text-small-regular cursor-not-allowed">
          India
        </div>

        {/* Hidden select so form ref still works correctly */}
        <select
          ref={innerRef}
          name={name}
          value="in"
          onChange={() => {}}
          aria-hidden="true"
          className="sr-only"
          tabIndex={-1}
        >
          <option value="in">India</option>
        </select>
      </div>
    )
  }
)

CountrySelect.displayName = "CountrySelect"

export default CountrySelect