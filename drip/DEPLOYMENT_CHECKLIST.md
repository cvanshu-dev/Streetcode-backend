# Razorpay Payment Provider - Deployment Checklist

Use this checklist before deploying the Razorpay payment provider to production or any environment.

## Pre-Deployment (Development)

- [ ] **Install Dependencies**
  ```bash
  npm install
  ```
  - Verify: `npm run postinstall` succeeds
  - Check: `node scripts/fix-razorpay-compatibility.js` returns "ready" status

- [ ] **Environment Setup**
  - [ ] Create `.env.local` file
  - [ ] Copy from `.env.razorpay.example`
  - [ ] Fill in `RAZORPAY_ID` and `RAZORPAY_SECRET`
  - [ ] Set at least one test account ID

- [ ] **Test Configuration**
  - [ ] Run: `node -e "console.log(require('./src/modules/payment/razorpay-config').generateRazorpayConfigReport())"`
  - [ ] Verify status shows "configured: true"
  - [ ] Verify mode shows "test (sandbox)"

- [ ] **Build Verification**
  ```bash
  npm run build
  ```
  - [ ] Build completes without errors
  - [ ] Pre-build patch script runs
  - [ ] No TypeScript errors
  - [ ] Plugin files found and verified

- [ ] **Local Testing**
  ```bash
  npm run dev
  ```
  - [ ] Server starts successfully
  - [ ] No payment module errors in logs
  - [ ] Razorpay provider initializes

- [ ] **Health Check Tests**
  ```bash
  curl http://localhost:3000/admin/razorpay/health
  ```
  - [ ] Response status is 200
  - [ ] `healthy` field is `true`
  - [ ] `status` is `ready`

- [ ] **Payment Flow Test**
  - [ ] Start test order checkout
  - [ ] Razorpay payment form appears
  - [ ] Test payment completes
  - [ ] Order status updates correctly

## Pre-Deployment (Rendering)

- [ ] **Update render.yaml**
  ```yaml
  env:
    - key: RAZORPAY_ID
      sync: false
    - key: RAZORPAY_SECRET
      sync: false
    - key: RAZORPAY_WEBHOOK_SECRET
      sync: false
  ```

- [ ] **Generate Production Razorpay Credentials**
  - [ ] Log into Razorpay Dashboard
  - [ ] Switch to Live Mode (not test mode)
  - [ ] Go to Settings → API Keys
  - [ ] Generate new live API keys
  - [ ] Copy Key ID and Key Secret
  - [ ] Save safely (password manager)

- [ ] **Create Webhook Endpoint**
  - [ ] In Razorpay Dashboard: Settings → Webhooks
  - [ ] Add webhook URL: `https://[your-domain]/store/razorpay/webhooks`
  - [ ] Select events: `payment.authorized`, `payment.captured`, `payment.failed`, `refund.created`
  - [ ] Generate and save webhook secret
  - [ ] Note the webhook secret

## Deployment (Render.com)

- [ ] **Configure Environment Variables**
  - [ ] Set `RAZORPAY_ID` to live key ID (rzp_live_xxx)
  - [ ] Set `RAZORPAY_SECRET` to live key secret
  - [ ] Set `RAZORPAY_WEBHOOK_SECRET` to webhook secret
  - [ ] Verify all are marked as Secret
  - [ ] Ensure Node env is production

- [ ] **Create Service**
  ```bash
  # Use Render dashboard UI or:
  git push render main
  ```
  - [ ] Check build logs
  - [ ] Verify post-install script runs
  - [ ] Verify `npm run build` succeeds
  - [ ] Note the deployed URL

- [ ] **Verify Deployment**
  ```bash
  curl https://[your-domain]/admin/razorpay/health
  ```
  - [ ] Health check returns 200
  - [ ] Status is "ready"
  - [ ] Configuration shows "configured: true"
  - [ ] Mode shows "live"

- [ ] **Update Razorpay Webhook URL**
  - [ ] In Razorpay Dashboard: Settings → Webhooks
  - [ ] Update webhook URL to: `https://[your-domain]/store/razorpay/webhooks`
  - [ ] Test webhook delivery
  - [ ] Verify logs show webhook received

## Post-Deployment Testing

- [ ] **Database Migration**
  ```bash
  npm run seed  # or your migration command
  ```
  - [ ] All migrations complete successfully

- [ ] **Payment Provider Service**
  ```bash
  curl https://[your-domain]/admin/razorpay/health \
    -H "Authorization: Bearer [admin-token]"
  ```
  - [ ] Response is 200
  - [ ] All configuration checks pass

- [ ] **Live Payment Test**
  - [ ] Create test order (use small amount)
  - [ ] Use Razorpay test card: `4111111111111111`
  - [ ] CVV: Any 3 digits
  - [ ] Expiry: Any future date
  - [ ] Complete payment
  - [ ] Verify order status updates to "paid"
  - [ ] Check logs for no errors

- [ ] **Webhook Simulation**
  - [ ] In Razorpay Dashboard, go to webhook settings
  - [ ] Click "Send" to resend recent webhooks
  - [ ] Check logs for webhook processing
  - [ ] Verify no errors in webhook handler

- [ ] **Edge Cases**
  - [ ] Test failed payment flow
  - [ ] Test refund request
  - [ ] Check webhook retry handling
  - [ ] Verify error messages are user-friendly

## Production Monitoring

- [ ] **Set Up Alerts**
  - [ ] Monitor payment failure rate
  - [ ] Alert on webhook failures
  - [ ] Monitor provider health endpoint
  - [ ] Set thresholds (e.g., >5% failure rate)

- [ ] **Log Monitoring**
  - [ ] Check logs for payment errors daily
  - [ ] Monitor for compatibility warnings
  - [ ] Review webhook processing logs
  - [ ] Look for signature validation failures

- [ ] **Regular Tests**
  - [ ] Daily: Test payment flow with real transactions
  - [ ] Weekly: Review payment metrics in Razorpay Dashboard
  - [ ] Weekly: Check webhook delivery logs in Razorpay
  - [ ] Monthly: Run full integration test suite

## Troubleshooting during Deployment

### Issue: Build fails with plugin errors

**Steps:**
1. Check node_modules: `ls node_modules/@tsc_tech/`
2. Run compatibility check: `node scripts/fix-razorpay-compatibility.js`
3. Verify package.json exports are patched
4. Clear build cache: `rm -rf .medusa build`
5. Rebuild: `npm run build`

### Issue: Plugin not loading in production

**Steps:**
1. Check environment variables are all set
2. Run health check: `curl /admin/razorpay/health`
3. Check logs for specific error
4. Verify patch-package was applied
5. Check file permissions on node_modules

### Issue: Webhooks not being received

**Steps:**
1. Verify webhook URL is publicly accessible
2. Check firewall/DNS settings
3. Verify RAZORPAY_WEBHOOK_SECRET is set
4. Send test webhook from Razorpay Dashboard
5. Check application logs for POST requests

### Issue: Payment provider shows as unconfigured

**Steps:**
1. Verify all env vars are set: `env | grep RAZORPAY`
2. Restart the application
3. Check for env variable name typos
4. Run health endpoint: `/admin/razorpay/health`
5. Review error messages in response

## Rollback Plan

If deployment fails:

1. **Immediate rollback:**
   ```bash
   # On Render
   git revert HEAD
   git push render main
   ```

2. **Verify previous version:**
   ```bash
   curl https://[your-domain]/admin/razorpay/health
   ```

3. **Disable Razorpay if critical:**
   - Remove from `medusa-config.ts`
   - Set `providers: []` in payment module
   - Rebuild and redeploy

4. **Investigate & report:**
   - Document error message
   - Check build logs
   - Review git diff
   - Prepare fix

## Sign-Off

- [ ] **QA Lead Sign-Off**
  - Name: _______________
  - Date: _______________
  - Signature: _______________

- [ ] **DevOps Lead Sign-Off**
  - Name: _______________
  - Date: _______________
  - Signature: _______________

- [ ] **Product Manager Sign-Off**
  - Name: _______________
  - Date: _______________
  - Signature: _______________

---

## Post-Deployment Follow-Up (24-48 hours)

- [ ] Monitor error rates
- [ ] Check transaction success rate
- [ ] Review customer reports
- [ ] Verify webhook processing
- [ ] Check payment provider health daily
- [ ] Monitor CPU/memory usage
- [ ] Review and archive logs

---

**Last Updated:** April 2025  
**Compatibility:** Medusa v2.13.1+ with @tsc_tech/medusa-plugin-razorpay-payment v0.0.11
