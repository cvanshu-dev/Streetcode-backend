import { Button } from "@medusajs/ui"
import Spinner from "@modules/common/icons/spinner"
import React, { useCallback, useEffect, useState } from "react"
import { useRazorpay, RazorpayOrderOptions } from "react-razorpay"
import { HttpTypes } from "@medusajs/types"
import { placeOrder } from "@lib/data/cart"
import { CurrencyCode } from "react-razorpay/dist/constants/currency"

export const RazorpayPaymentButton = ({
  session,
  notReady,
  cart,
}: {
  session: HttpTypes.StorePaymentSession
  notReady: boolean
  cart: HttpTypes.StoreCart
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
  const [orderData, setOrderData] = useState({ id: "" })

  const { isLoading, error, Razorpay } = useRazorpay() // 👈 destructure all three

  useEffect(() => {
    setOrderData(session.data as { id: string })
  }, [session.data])

  const onPaymentCompleted = async () => {
    await placeOrder().catch(() => {
      setErrorMessage("An error occurred, please try again.")
      setSubmitting(false)
    })
  }

  const handlePayment = useCallback(async () => {
    if (!Razorpay) {
      setErrorMessage("Payment gateway not loaded. Please refresh and try again.")
      return
    }

    setSubmitting(true)
    setErrorMessage(undefined)

    const options: RazorpayOrderOptions = {
      callback_url: `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/razorpay/hooks`,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY ?? "",
      amount: session.amount,
      order_id: orderData.id,
      currency: cart.currency_code.toUpperCase() as CurrencyCode,
      name: process.env.COMPANY_NAME ?? "Your Company",
      description: `Order number ${orderData.id}`,
      remember_customer: true,
      image: "https://example.com/your_logo",
      modal: {
        backdropclose: true,
        escape: true,
        handleback: true,
        confirm_close: true,
        ondismiss: async () => {
          setSubmitting(false)
          setErrorMessage("Payment cancelled.")
        },
        animation: true,
      },
      handler: async () => {
        await onPaymentCompleted()
      },
      prefill: {
        name: `${cart.billing_address?.first_name ?? ""} ${cart.billing_address?.last_name ?? ""}`.trim(),
        email: cart?.email,
        contact: cart?.shipping_address?.phone ?? undefined,
      },
    }

    const razorpay = new Razorpay(options)

    razorpay.on("payment.failed", function (response: any) {
      setErrorMessage(JSON.stringify(response.error))
      setSubmitting(false)
    })

    razorpay.on("payment.authorized" as any, function () {
      placeOrder()
    })

    if (orderData.id) razorpay.open()

  }, [
    Razorpay,
    cart,
    orderData.id,
    session.amount,
  ])

  return (
    <>
      <Button
        disabled={submitting || notReady || isLoading || !orderData?.id || !!error} // 👈 also disable while script loads
        onClick={handlePayment}
      >
        {submitting || isLoading ? <Spinner /> : "Checkout"}
      </Button>
      {error && (
        <div className="text-red-500 text-small-regular mt-2">
          Failed to load payment gateway.
        </div>
      )}
      {errorMessage && (
        <div className="text-red-500 text-small-regular mt-2">
          {errorMessage}
        </div>
      )}
    </>
  )
}