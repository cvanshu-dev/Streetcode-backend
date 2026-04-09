import { useCallback, useRef, useState } from "react"
import { lookupPinCode } from "@lib/util/pincode-lookup"


export interface AutofillFields {
  city: string;
  province: string;
}

export function usePincodeAutofill() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const lastQueried = useRef<string>("")
  

  const triggerLookup = useCallback(
    async (pinCode: string): Promise<AutofillFields | null> => {
      const trimmed = pinCode.trim()

      // Skip if same PIN was already looked up
      if (trimmed === lastQueried.current) return null

      lastQueried.current = trimmed
      setError(null)
      setLoading(true)

      try {
        const result = await lookupPinCode(trimmed)

        if (!result) {
          setError("Invalid PIN code. Please check and try again.")
          return null
        }

        return {
          city: result.city,
          province: result.state,
        }
      } catch {
        setError("Could not fetch PIN details. Try again.")
        return null
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { loading, error, triggerLookup }
}