# Quick Start: Razorpay Payment Provider for Medusa v2.13.1

## TL;DR - Get Started in 5 Minutes

### 1. Install & Fix ✓
```bash
npm install
# Automatic compatibility fixes run via postinstall script
```

### 2. Configure Razorpay 🔧
```bash
# Copy environment template
cp .env.razorpay.example .env.local

# Add your Razorpay credentials
# Get from: https://dashboard.razorpay.com/app/settings/api-keys
RAZORPAY_ID=rzp_test_xxxxx
RAZORPAY_SECRET=xxxxxxxxxx
```

### 3. Build & Run 🚀
```bash
npm run build
npm start
# or for development:
npm run dev
```

### 4. Test Health ✅
```bash
curl http://localhost:3000/admin/razorpay/health
```

**Expected Response:**
```json
{
  "healthy": true,
  "status": "ready",
  "configuration": {
    "hasKeyId": true,
    "hasKeySecret": true
  }
}
```

✅ Done! Payment provider is ready.

---

## File Structure

```
src/modules/payment/
├── providers/razorpay-compatibility/  ← Wrapper (transparent to your code)
│   ├── index.ts
│   ├── adapter.ts
│   ├── service-wrapper.ts
│   └── types.ts
├── razorpay-config.ts                 ← Configuration utilities
└── ...

src/api/
├── store/razorpay/webhooks/           ← Webhook endpoint
│   └── route.ts
└── admin/razorpay/health/             ← Health check
    └── route.ts

scripts/
├── fix-razorpay-compatibility.js      ← Auto-patch (runs post-install)
└── patch-razorpay-on-build.js         ← Pre-build check
```

---

## Configuration

### Required (Copy from Razorpay Dashboard)
```env
RAZORPAY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_SECRET=xxxxxxxxxxxxxxxx
```

### Optional
```env
RAZORPAY_ACCOUNT=acc_xxxxxxxx          # Multi-account support
RAZORPAY_WEBHOOK_SECRET=secret          # Webhook verification
```

---

## API Endpoints

### Store (for checkout/payments)
- **POST** `/store/razorpay/webhooks` - Receive payment events

### Admin (for monitoring)
- **GET** `/admin/razorpay/health` - Health check
  ```bash
  curl http://localhost:3000/admin/razorpay/health
  ```

---

## Payment Integration Example

```typescript
// In your checkout logic
const paymentSession = await paymentService.createPaymentSession({
  provider_id: "razorpay",
  amount: 1000,       // amount in cents/paise
  currency: "INR",
  customer_id: customerId,
})

// Razorpay payment form will load automatically
```

---

## Troubleshooting

### Plugin not found?
```bash
npm run postinstall
node scripts/fix-razorpay-compatibility.js
```

### Build fails?
```bash
rm -rf .medusa build node_modules
npm install
npm run build
```

### Webhooks not working?
1. Check webhook URL in Razorpay Dashboard
2. Verify `RAZORPAY_WEBHOOK_SECRET` is set
3. Logs should show: `Received Razorpay webhook event: payment.authorized`

### Test payment failing?
- Use card: `4111111111111111`
- Any CVV: `123`
- Any future date
- Check `/admin/razorpay/health` shows "ready"

---

## Environment Modes

### Development (Default)
```env
RAZORPAY_ID=rzp_test_xxxxx   # Test key
NODE_ENV=development
```
- Uses test/sandbox payments
- No real money charged
- Instant test payment processing

### Production
```env
RAZORPAY_ID=rzp_live_xxxxx   # Live key
NODE_ENV=production
RAZORPAY_WEBHOOK_SECRET=xxx  # Set for security
```
- Real payments are processed
- Money is actually charged
- Webhook signature verification is required

---

## Testing Checklist

- [ ] `npm install` completes without errors
- [ ] `/admin/razorpay/health` returns 200 with "ready" status
- [ ] Test payment flow works end-to-end
- [ ] Webhook test from Razorpay logs in application
- [ ] Payment status updates after webhook received
- [ ] Failed payment handled gracefully
- [ ] Refund flow works

---

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| `Cannot find module` | Run `npm run postinstall` |
| `RAZORPAY_ID is undefined` | Set env var in `.env.local` |
| Health check 404 | Check API version import |
| Webhooks 401 | Verify webhook secret matches |
| Payment session fails | Check wrapper initialization logs |

---

## Getting Help

1. **Check Logs:**
   ```bash
   DEBUG=medusa:payment npm run dev 2>&1 | grep -i razorpay
   ```

2. **Health Endpoint:**
   ```bash
   curl http://localhost:3000/admin/razorpay/health | jq .
   ```

3. **Configuration Report:**
   ```bash
   node -e "console.log(require('./src/modules/payment/razorpay-config').generateRazorpayConfigReport())"
   ```

4. **Documentation:**
   - Full guide: `RAZORPAY_COMPATIBILITY_GUIDE.md`
   - Deployment: `DEPLOYMENT_CHECKLIST.md`
   - Razorpay docs: https://razorpay.com/docs

---

## Key Files

| File | Purpose |
|------|---------|
| `medusa-config.ts` | Uses compatibility wrapper |
| `src/modules/payment/providers/razorpay-compatibility/` | Wrapper layer (transparent) |
| `src/api/store/razorpay/webhooks/route.ts` | Payment webhooks |
| `src/api/admin/razorpay/health/route.ts` | Health monitoring |
| `scripts/fix-razorpay-compatibility.js` | Post-install patch |
| `patches/@tsc_tech+medusa-plugin-razorpay-payment+0.0.11.patch` | Package fixes |

---

## What's Different?

**Before (Broken in v2.13.1):**
- Direct plugin use: `@tsc_tech/medusa-plugin-razorpay-payment/providers/razorpay`
- Error: API incompatibilities with v2.13.1

**After (Works in v2.13.1):**
- Uses wrapper: `./src/modules/payment/providers/razorpay-compatibility`
- Transparent to your code - no changes needed
- Automatic version adaptation
- Better error handling & fallbacks

---

## Next Steps

1. ✅ Install and test locally
2. ✅ Push to staging environment
3. ✅ Verify payments work in staging
4. ✅ Deploy to production using `DEPLOYMENT_CHECKLIST.md`
5. ✅ Monitor payment metrics

---

**Questions?** Check `RAZORPAY_COMPATIBILITY_GUIDE.md` for comprehensive documentation.

**Ready to deploy?** Follow `DEPLOYMENT_CHECKLIST.md` step-by-step.

---

Last updated: April 2025  
Medusa v2.13.1 | Razorpay v0.0.11 | Node 20.x
