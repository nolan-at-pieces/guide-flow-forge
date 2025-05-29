
---
title: "Installation"
description: "Step-by-step installation guide"
order: 1
tags: ["installation", "setup", "npm", "yarn"]
---

# Installation

Get up and running quickly with our platform using your preferred package manager.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 16.0 or higher)
- **npm** (version 7.0 or higher) or **yarn** (version 1.22 or higher)

## Package Manager Installation

### Using npm

```bash
npm install @yourcompany/platform
```

### Using yarn

```bash
yarn add @yourcompany/platform
```

### Using pnpm

```bash
pnpm add @yourcompany/platform
```

## Verification

Verify your installation by checking the version:

```bash
npx @yourcompany/platform --version
```

## Environment Setup

### Development Environment

1. Create a new project directory:
   ```bash
   mkdir my-project
   cd my-project
   ```

2. Initialize your project:
   ```bash
   npm init -y
   ```

3. Install the platform:
   ```bash
   npm install @yourcompany/platform
   ```

### Configuration File

Create a configuration file in your project root:

```javascript
// platform.config.js
module.exports = {
  apiKey: process.env.PLATFORM_API_KEY,
  environment: 'development',
  features: {
    analytics: true,
    logging: true
  }
};
```

## Environment Variables

Set up your environment variables:

```bash
# .env
PLATFORM_API_KEY=your_api_key_here
PLATFORM_ENV=development
```

## Next Steps

Now that you have the platform installed:

1. [Quick Start Guide](quick-start) - Build your first integration
2. [Configuration](configuration) - Customize your setup
3. [API Reference](../api-reference) - Explore available endpoints

## Troubleshooting

### Common Issues

**Permission errors on npm install:**
```bash
sudo npm install -g @yourcompany/platform
```

**Version conflicts:**
```bash
npm list @yourcompany/platform
npm update @yourcompany/platform
```

**Clear npm cache:**
```bash
npm cache clean --force
```

Need more help? Check our [troubleshooting guide](../troubleshooting) or contact support.
