"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
(0, utils_1.loadEnv)(process.env.NODE_ENV || 'development', process.cwd());
exports.default = (0, utils_1.defineConfig)({
    projectConfig: {
        databaseUrl: process.env.DATABASE_URL,
        http: {
            storeCors: process.env.STORE_CORS,
            adminCors: process.env.ADMIN_CORS,
            authCors: process.env.AUTH_CORS,
            jwtSecret: process.env.JWT_SECRET || "supersecret",
            cookieSecret: process.env.COOKIE_SECRET || "supersecret",
        }
    },
    modules: [
        {
            resolve: "@medusajs/medusa/payment",
            options: {
                providers: [
                    {
                        resolve: "@tsc_tech/medusa-plugin-razorpay-payment/providers/razorpay",
                        id: "razorpay",
                        options: {
                            key_id: process?.env?.RAZORPAY_TEST_KEY_ID ??
                                process?.env?.RAZORPAY_ID,
                            key_secret: process?.env?.RAZORPAY_TEST_KEY_SECRET ??
                                process?.env?.RAZORPAY_SECRET,
                            razorpay_account: process?.env?.RAZORPAY_TEST_ACCOUNT ??
                                process?.env?.RAZORPAY_ACCOUNT,
                            automatic_expiry_period: 30 /* any value between 12minuts and 30 days expressed in minutes*/,
                            manual_expiry_period: 20,
                            refund_speed: "normal",
                            webhook_secret: process?.env?.RAZORPAY_TEST_WEBHOOK_SECRET ??
                                process?.env?.RAZORPAY_WEBHOOK_SECRET
                        }
                    },
                ],
            },
        },
    ],
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVkdXNhLWNvbmZpZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL21lZHVzYS1jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFBaUU7QUFFakUsSUFBQSxlQUFPLEVBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLElBQUksYUFBYSxFQUFFLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFBO0FBRTdELGtCQUFlLElBQUEsb0JBQVksRUFBQztJQUMxQixhQUFhLEVBQUU7UUFDYixXQUFXLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZO1FBQ3JDLElBQUksRUFBRTtZQUNKLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVc7WUFDbEMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVztZQUNsQyxRQUFRLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFVO1lBQ2hDLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSSxhQUFhO1lBQ2xELFlBQVksRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsSUFBSSxhQUFhO1NBQ3pEO0tBQ0Y7SUFDRCxPQUFPLEVBQUU7UUFDUDtZQUNFLE9BQU8sRUFBRSwwQkFBMEI7WUFDbkMsT0FBTyxFQUFFO2dCQUNQLFNBQVMsRUFBRTtvQkFDVDt3QkFDRSxPQUFPLEVBQUUsNkRBQTZEO3dCQUN0RSxFQUFFLEVBQUUsVUFBVTt3QkFDZCxPQUFPLEVBQUU7NEJBQ1AsTUFBTSxFQUNGLE9BQU8sRUFBRSxHQUFHLEVBQUUsb0JBQW9CO2dDQUNsQyxPQUFPLEVBQUUsR0FBRyxFQUFFLFdBQVc7NEJBQzdCLFVBQVUsRUFDTixPQUFPLEVBQUUsR0FBRyxFQUFFLHdCQUF3QjtnQ0FDdEMsT0FBTyxFQUFFLEdBQUcsRUFBRSxlQUFlOzRCQUNqQyxnQkFBZ0IsRUFDWixPQUFPLEVBQUUsR0FBRyxFQUFFLHFCQUFxQjtnQ0FDbkMsT0FBTyxFQUFFLEdBQUcsRUFBRSxnQkFBZ0I7NEJBQ2xDLHVCQUF1QixFQUFFLEVBQUUsQ0FBQyxnRUFBZ0U7NEJBQzVGLG9CQUFvQixFQUFFLEVBQUU7NEJBQ3hCLFlBQVksRUFBRSxRQUFROzRCQUN0QixjQUFjLEVBQ1YsT0FBTyxFQUFFLEdBQUcsRUFBRSw0QkFBNEI7Z0NBQzFDLE9BQU8sRUFBRSxHQUFHLEVBQUUsdUJBQXVCO3lCQUM1QztxQkFDQTtpQkFDRjthQUNGO1NBQ0Y7S0FDRjtDQUNGLENBQUMsQ0FBQSJ9