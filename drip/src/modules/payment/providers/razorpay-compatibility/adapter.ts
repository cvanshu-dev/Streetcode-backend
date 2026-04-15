/**
 * API Adapter: Bridges Medusa v2.7.1 plugin with v2.13.1 application
 * Handles interface and method signature changes between versions
 */

import { MedusaError, MedusaErrorTypes, PaymentSessionStatus } from "@medusajs/utils"

/**
 * Adapter to make v2.7.1 payment provider work with v2.13.1
 * Intercepts method calls and adapts signatures when needed
 */
export class RazorpayProviderAdapter {
  private logger: any
  private originalProvider: any

  constructor(
    provider: any,
    logger: any
  ) {
    this.originalProvider = provider
    this.logger = logger
  }

  /**
   * Safely call provider methods with version detection
   */
  async callProviderMethod(
    methodName: string,
    args: any[],
    fallback?: (...args: any[]) => Promise<any>
  ): Promise<any> {
    try {
      const method = (this.originalProvider as any)[methodName]

      if (typeof method !== "function") {
        this.logger.warn(
          `Method ${methodName} not found on provider, using fallback`
        )
        if (fallback) {
          return await fallback(...args)
        }
        throw new MedusaError(
          MedusaErrorTypes.NOT_FOUND,
          `Method ${methodName} not available on payment provider`
        )
      }

      return await method.apply(this.originalProvider, args)
    } catch (error: any) {
      this.logger.error(
        `Error calling provider method ${methodName}: ${error.message}`
      )
      throw this.normalizeError(error)
    }
  }

  /**
   * Normalize errors from different Medusa versions
   */
  normalizeError(error: any): Error {
    // If error already has the right structure, return it
    if (error instanceof MedusaError) {
      return error
    }

    // Handle v2.7.1 error format
    if (error?.code || error?.detail) {
      return new MedusaError(
        MedusaErrorTypes.INVALID_DATA,
        error.detail || error.message || "Payment processing error"
      )
    }

    // Default error handling
    return new MedusaError(
      MedusaErrorTypes.INVALID_DATA,
      error?.message || "Unknown payment provider error"
    )
  }

  /**
   * Adapt input parameters between versions
   * v2.7.1 might have different field names or structures
   */
  adaptInput(version: string, methodName: string, input: any): any {
    if (version === "2.7.1") {
      // Apply v2.7.1 specific input transformations
      switch (methodName) {
        case "createPaymentSession":
        case "updatePaymentSession":
        case "authorizePaymentSession":
          // Ensure required fields exist
          if (input && !input.currency) {
            input.currency = input.currency_code || "USD"
          }
          break
      }
    }

    return input
  }

  /**
   * Adapt output between versions
   * v2.7.1 might return different field names or structures
   */
  adaptOutput(version: string, methodName: string, output: any): any {
    if (version === "2.7.1") {
      // Apply v2.7.1 specific output transformations
      switch (methodName) {
        case "retrievePaymentSession":
          // Ensure status field uses new enum names if needed
          if (output?.status) {
            output.status = this.mapPaymentStatus(output.status)
          }
          break
      }
    }

    return output
  }

  /**
   * Map payment status between versions
   */
  private mapPaymentStatus(status: string): PaymentSessionStatus {
    const statusMap: Record<string, PaymentSessionStatus> = {
      pending: PaymentSessionStatus.PENDING,
      authorized: PaymentSessionStatus.AUTHORIZED,
      captured: PaymentSessionStatus.CAPTURED,
      canceled: PaymentSessionStatus.CANCELED,
      requires_more: PaymentSessionStatus.REQUIRES_MORE,
      error: PaymentSessionStatus.ERROR,
    }

    return statusMap[status?.toLowerCase()] || PaymentSessionStatus.PENDING
  }
}
