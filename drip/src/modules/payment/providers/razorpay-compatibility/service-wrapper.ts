/**
 * Razorpay Payment Service Wrapper
 * Wraps the @tsc_tech plugin service to ensure v2.13.1 compatibility
 */

import {
  AbstractPaymentProvider,
  MedusaError,
  MedusaErrorTypes,
  PaymentSessionStatus,
} from "@medusajs/utils"

import { RazorpayProviderAdapter } from "./adapter"

/**
 * Wrapper service that ensures compatibility with both v2.7.1 plugin and v2.13.1 framework
 */
export class RazorpayServiceWrapper extends AbstractPaymentProvider {
  static identifier = "razorpay"

  private wrappedProvider: any
  private adapter: RazorpayProviderAdapter
  private logger: any
  private containerRef: any
  private optionsRef: any

  constructor(container: any, options: any) {
    super(container, options)

    this.logger = container.logger || console
    this.containerRef = container
    this.optionsRef = options

    try {
      this.wrappedProvider = this.initializePluginProvider(container, options)
      this.adapter = new RazorpayProviderAdapter(this.wrappedProvider, this.logger)

      if (this.logger?.info) {
        this.logger.info("Razorpay provider wrapper initialized")
      }
    } catch (error: any) {
      const msg = error?.message || String(error)
      if (this.logger?.error) {
        this.logger.error(`Failed to initialize Razorpay provider: ${msg}`)
      }
      throw error
    }
  }

  private initializePluginProvider(container: any, options: any): any {
    try {
      const RazorpayServiceModule = require("@tsc_tech/medusa-plugin-razorpay-payment/providers/razorpay")
      const RazorpayService = RazorpayServiceModule.default || RazorpayServiceModule

      if (!RazorpayService) {
        throw new Error("Could not load RazorpayService from plugin")
      }

      return new RazorpayService(container, options)
    } catch (error: any) {
      throw new MedusaError(
        MedusaErrorTypes.INVALID_ARGUMENT,
        `Failed to load Razorpay payment provider: ${error?.message || "Unknown error"}`
      )
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (typeof (this.wrappedProvider as any).validateOptions === "function") {
        ;(this.wrappedProvider as any).validateOptions(this.optionsRef)
      }
      return true
    } catch {
      return false
    }
  }

  async initializePayment(input: any): Promise<Record<string, any>> {
    try {
      const result = await this.adapter.callProviderMethod(
        "initializePayment",
        [input],
        async () => ({})
      )
      return result
    } catch (error) {
      throw new MedusaError(
        MedusaErrorTypes.INVALID_ARGUMENT,
        `Failed to initialize payment: ${error instanceof Error ? error.message : "Unknown error"}`
      )
    }
  }

  async authorizePayment(input: any): Promise<any> {
    try {
      const result = await this.adapter.callProviderMethod(
        "authorizePaymentSession",
        [input]
      )
      return {
        status: result?.status || PaymentSessionStatus.PENDING,
        ...result,
      }
    } catch (error) {
      throw new MedusaError(
        MedusaErrorTypes.INVALID_ARGUMENT,
        `Failed to authorize payment: ${error instanceof Error ? error.message : "Unknown error"}`
      )
    }
  }

  async capturePayment(input: any): Promise<any> {
    try {
      const result = await this.adapter.callProviderMethod(
        "capturePaymentSession",
        [input]
      )
      return {
        status: result?.status || PaymentSessionStatus.PENDING,
        ...result,
      }
    } catch (error) {
      throw new MedusaError(
        MedusaErrorTypes.INVALID_ARGUMENT,
        `Failed to capture payment: ${error instanceof Error ? error.message : "Unknown error"}`
      )
    }
  }

  async refundPayment(input: any): Promise<any> {
    try {
      const result = await this.adapter.callProviderMethod(
        "refundPaymentSession",
        [input]
      )
      return {
        status: result?.status || PaymentSessionStatus.PENDING,
        ...result,
      }
    } catch (error) {
      throw new MedusaError(
        MedusaErrorTypes.INVALID_ARGUMENT,
        `Failed to refund payment: ${error instanceof Error ? error.message : "Unknown error"}`
      )
    }
  }

  async cancelPayment(input: any): Promise<Record<string, any>> {
    try {
      await this.adapter.callProviderMethod("deletePaymentSession", [input])
      return {}
    } catch (error) {
      throw new MedusaError(
        MedusaErrorTypes.INVALID_ARGUMENT,
        `Failed to cancel payment: ${error instanceof Error ? error.message : "Unknown error"}`
      )
    }
  }

  async updatePayment(input: any): Promise<Record<string, any>> {
    try {
      const result = await this.adapter.callProviderMethod(
        "updatePaymentSession",
        [input]
      )
      return result
    } catch (error) {
      throw new MedusaError(
        MedusaErrorTypes.INVALID_ARGUMENT,
        `Failed to update payment: ${error instanceof Error ? error.message : "Unknown error"}`
      )
    }
  }

  async validateHook(input: any): Promise<boolean> {
    return true
  }

  async getPaymentStatus(input: any): Promise<{ status: PaymentSessionStatus }> {
    try {
      const result = await this.adapter.callProviderMethod("getPaymentStatus", [input])

      if (result?.status) {
        return {
          status: result.status as PaymentSessionStatus,
        }
      }

      return {
        status: PaymentSessionStatus.PENDING,
      }
    } catch {
      return {
        status: PaymentSessionStatus.PENDING,
      }
    }
  }

  async handleWebhook(payload: Record<string, any>): Promise<Record<string, any>> {
    try {
      const result = await this.adapter.callProviderMethod("handleWebhook", [payload])
      return result
    } catch (error) {
      if (this.logger?.error) {
        this.logger.error(
          `Webhook handling error: ${error instanceof Error ? error.message : "Unknown error"}`
        )
      }
      return { success: false }
    }
  }

  async createPaymentSession(input: any): Promise<Record<string, any>> {
    try {
      const result = await this.adapter.callProviderMethod(
        "createPaymentSession",
        [input]
      )
      return result
    } catch (error) {
      throw new MedusaError(
        MedusaErrorTypes.INVALID_ARGUMENT,
        `Failed to create payment session: ${error instanceof Error ? error.message : "Unknown error"}`
      )
    }
  }

  async updatePaymentSession(input: any): Promise<Record<string, any>> {
    return this.updatePayment(input)
  }

  async retrievePaymentSession(input: Record<string, any>): Promise<Record<string, any>> {
    try {
      const result = await this.adapter.callProviderMethod(
        "retrievePaymentSession",
        [input]
      )
      return result
    } catch (error) {
      throw new MedusaError(
        MedusaErrorTypes.INVALID_ARGUMENT,
        `Failed to retrieve payment session: ${error instanceof Error ? error.message : "Unknown error"}`
      )
    }
  }

  async deletePaymentSession(input: any): Promise<void> {
    try {
      await this.adapter.callProviderMethod("deletePaymentSession", [input])
    } catch (error) {
      throw new MedusaError(
        MedusaErrorTypes.INVALID_ARGUMENT,
        `Failed to delete payment session: ${error instanceof Error ? error.message : "Unknown error"}`
      )
    }
  }

  async initiatePayment(input: any): Promise<Record<string, any> & { id: string }> {
    try {
      const result = await this.adapter.callProviderMethod(
        "initiatePayment",
        [input],
        async () => ({ id: input?.session_id || "razorpay_session", redirect_url: "", data: {} })
      )
      return {
        id: result?.id || input?.session_id || "razorpay_session",
        ...result,
      }
    } catch (error) {
      // initiatePayment may not be available, return minimal response
      return {
        id: input?.session_id || "razorpay_session",
        redirect_url: "",
        data: {},
      }
    }
  }

  async deletePayment(input: any): Promise<Record<string, any>> {
    return this.deletePaymentSession(input) as any
  }

  async retrievePayment(input: any): Promise<Record<string, any>> {
    return this.retrievePaymentSession(input)
  }

  async getWebhookActionAndData(input: Record<string, any>): Promise<any> {
    try {
      const payload = input.data ? JSON.parse(input.data as string) : input
      const event = payload.event || "payment.unknown"
      
      // Map Razorpay events to PaymentActions
      const actionMap: Record<string, string> = {
        "payment.authorized": "authorized",
        "payment.captured": "captured",
        "payment.failed": "failed",
        "payment.refunded": "refunded",
        "order.paid": "captured",
      }
      
      const action = actionMap[event] || "authorized"
      
      return {
        action,
        data: payload,
      }
    } catch {
      return {
        action: "authorized",
        data: input,
      }
    }
  }
}
