#!/usr/bin/env node

/**
 * Auto-patch script for Razorpay plugin compatibility
 * Runs after npm install to ensure @tsc_tech/medusa-plugin-razorpay-payment works with Medusa v2.13.1
 *
 * Usage:
 *   node scripts/fix-razorpay-compatibility.js
 *   or add to package.json: "postinstall": "node scripts/fix-razorpay-compatibility.js"
 */

const fs = require("fs")
const path = require("path")

const PLUGIN_PATH = path.join(
  __dirname,
  "../node_modules/@tsc_tech/medusa-plugin-razorpay-payment"
)
const PLUGIN_PACKAGE_JSON = path.join(PLUGIN_PATH, "package.json")

// Color output for terminal
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
}

function log(level, message) {
  const timestamp = new Date().toISOString()
  const prefix = {
    info: `${colors.blue}[INFO]${colors.reset}`,
    success: `${colors.green}[SUCCESS]${colors.reset}`,
    warn: `${colors.yellow}[WARN]${colors.reset}`,
    error: `${colors.red}[ERROR]${colors.reset}`,
  }

  console.log(`${prefix[level]} ${timestamp} - ${message}`)
}

function checkPluginInstalled() {
  if (!fs.existsSync(PLUGIN_PATH)) {
    log("error", "Plugin not found at: " + PLUGIN_PATH)
    return false
  }
  log("info", "Plugin found at: " + PLUGIN_PATH)
  return true
}

function fixPackageJSONExports() {
  try {
    if (!fs.existsSync(PLUGIN_PACKAGE_JSON)) {
      log("warn", "package.json not found, skipping exports fix")
      return false
    }

    const content = fs.readFileSync(PLUGIN_PACKAGE_JSON, "utf-8")
    const packageJson = JSON.parse(content)

    // Check if exports already have the structure we need
    const hasRazorpayExport =
      packageJson.exports &&
      packageJson.exports["./providers/razorpay"]

    if (hasRazorpayExport) {
      log("info", "Exports already properly configured")
      return true
    }

    // Fix exports for v2.13.1 compatibility
    if (!packageJson.exports) {
      packageJson.exports = {}
    }

    const newExports = {
      "./package.json": "./package.json",
      "./providers/razorpay": {
        import: "./.medusa/server/src/providers/razorpay/index.js",
        require: "./.medusa/server/src/providers/razorpay/index.js",
      },
      "./providers/razorpay/services": "./.medusa/server/src/providers/razorpay/services/index.js",
      "./providers/razorpay/types": "./.medusa/server/src/providers/razorpay/types/index.js",
      "./providers/razorpay/utils": "./.medusa/server/src/providers/razorpay/utils/index.js",
      "./providers/razorpay/core": "./.medusa/server/src/providers/razorpay/core/index.js",
      "./workflows": "./.medusa/server/src/workflows/index.js",
      "./.medusa/server/src/modules/*": "./.medusa/server/src/modules/*/index.js",
      "./providers/*": {
        import: "./.medusa/server/src/providers/*/index.js",
        require: "./.medusa/server/src/providers/*/index.js",
      },
      "./*": "./.medusa/server/src/*.js",
    }

    packageJson.exports = newExports

    // Update peer dependencies to allow multiple Medusa v2.x versions
    if (packageJson.peerDependencies) {
      const peersToUpdate = [
        "@medusajs/admin-sdk",
        "@medusajs/cli",
        "@medusajs/framework",
        "@medusajs/icons",
        "@medusajs/medusa",
        "@medusajs/test-utils",
      ]

      peersToUpdate.forEach((pkg) => {
        if (packageJson.peerDependencies[pkg]) {
          packageJson.peerDependencies[pkg] = "2.x"
        }
      })

      log("info", "Updated peer dependencies to accept Medusa 2.x")
    }

    fs.writeFileSync(PLUGIN_PACKAGE_JSON, JSON.stringify(packageJson, null, 2))

    log("success", "package.json exports fixed")
    return true
  } catch (error) {
    log("error", "Failed to fix package.json exports: " + error.message)
    return false
  }
}

function verifyPluginStructure() {
  const filesToCheck = [
    "./.medusa/server/src/providers/razorpay/index.js",
    "./.medusa/server/src/providers/razorpay/services/index.js",
    "./.medusa/server/src/providers/razorpay/types/index.js",
  ]

  let allFilesExist = true

  filesToCheck.forEach((file) => {
    const fullPath = path.join(PLUGIN_PATH, file)
    const exists = fs.existsSync(fullPath)

    if (!exists) {
      log("warn", `File not found: ${file}`)
      allFilesExist = false
    }
  })

  if (allFilesExist) {
    log("success", "All plugin files verified")
  }

  return allFilesExist
}

function createCompatibilityReport() {
  const report = {
    timestamp: new Date().toISOString(),
    plugin_version: "0.0.11",
    medusa_version: "2.13.1",
    status: "patched",
    checks: {
      plugin_installed: checkPluginInstalled(),
      exports_fixed: false,
      structure_verified: false,
    },
  }

  report.checks.exports_fixed = fixPackageJSONExports()
  report.checks.structure_verified = verifyPluginStructure()

  const allChecks = Object.values(report.checks).every((v) => v === true)
  report.status = allChecks ? "ready" : "needs_attention"

  return report
}

function main() {
  console.log("")
  log("info", "Starting Razorpay plugin compatibility fix...")
  console.log("")

  try {
    const report = createCompatibilityReport()

    console.log("")
    log("info", "Compatibility Report:")
    console.log(JSON.stringify(report, null, 2))
    console.log("")

    if (report.status === "ready") {
      log(
        "success",
        "Razorpay plugin is ready for Medusa v2.13.1 deployment"
      )
      process.exit(0)
    } else {
      log(
        "warn",
        "Razorpay plugin needs attention. Some checks failed. Manual intervention may be required."
      )
      process.exit(1)
    }
  } catch (error) {
    log("error", "Fatal error: " + error.message)
    console.error(error)
    process.exit(1)
  }
}

// Run the script
main()
