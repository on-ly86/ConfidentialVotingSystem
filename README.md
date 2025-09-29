# AnonymousReportPlatform

A privacy-first decentralized anonymous reporting platform built on Ethereum, allowing employees or stakeholders to submit encrypted reports with full anonymity. Reports include a title, description, and category. The system aggregates category statistics while ensuring that individual report details remain confidential. All users can view the report list and details, but reporter identities are never exposed.

## Live Demo

Try the live application: [https://anonymous-report-platform.vercel.app/](https://anonymous-report-platform.vercel.app/)

## Project Background

Traditional corporate reporting systems often face problems of privacy, trust, and retaliation:

• Fear of retaliation: Employees may avoid reporting issues due to identity exposure risks  

• Centralized control: Administrators may manipulate or suppress reports  

• Lack of transparency: Employees cannot verify if their reports are counted or handled properly  

• Limited statistics: Organizations lack trustworthy aggregated insights  

AnonymousReportPlatform solves these challenges with a blockchain-based system where:  

• All reports are submitted via smart contracts and stored immutably on-chain  

• Reports are encrypted before submission — even administrators cannot access the raw content  

• Category statistics are aggregated without revealing individual data  

• The process is transparent, immutable, and trustless  

## Features

### Core Functionality

• Report Submission: Users submit encrypted reports with title, content, and category  

• Category Statistics: Aggregated counts of reports per category, available to all users  

• Report Listing: All users can view existing reports and details (encrypted when necessary)  

• Anonymous Access: No identity information is stored or linked to reports  

• Real-time Dashboard: View latest reports, categories, and statistics instantly  

### Privacy & Anonymity

• Client-side Encryption: Reports are encrypted before leaving the user’s device  

• Fully Anonymous: No wallet, account, or identity required to submit reports  

• Immutable Records: Reports cannot be altered or deleted once submitted  

• Encrypted Processing: Report data remains protected during aggregation  

## Architecture

### Smart Contracts

AnonymousReportPlatform.sol (deployed on Ethereum)  

• Manages report submissions (title, content, category)  

• Maintains immutable report storage on-chain  

• Aggregates category statistics automatically  

• Provides transparent, public access to report data and counts  

### Frontend Application

• React + TypeScript: Interactive and responsive UI  

• Ethers.js: Blockchain interaction and contract calls  

• Modern UI/UX: Dashboard with category tabs, search, and statistics  

• Wallet Integration: Ethereum wallet support (optional, for certain deployments)  

• Real-time Updates: Fetches reports and statistics directly from blockchain  

## Technology Stack

### Blockchain

• Solidity ^0.8.24: Smart contract development  

• OpenZeppelin: Secure libraries for contract patterns  

• Hardhat: Development, testing, and deployment framework  

• Ethereum Sepolia Testnet: Current deployment network  

### Frontend

• React 18 + TypeScript: Modern frontend framework  

• Ethers.js: Ethereum blockchain interaction  

• React Icons: UI iconography  

• Tailwind + CSS: Styling and responsive layout  

• Vercel: Frontend deployment platform  

## Installation

### Prerequisites

• Node.js 18+  

• npm / yarn / pnpm package manager  

• Ethereum wallet (MetaMask, WalletConnect, etc.)  

### Setup

```bash
# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Deploy to network (configure hardhat.config.js first)
npx hardhat run deploy/deploy.ts --network sepolia

# Start the development server
cd frontend

# Install dependencies
npm install

# Run
npm run dev
```

## Usage

• Connect Wallet: (optional) for authenticated deployments  

• Browse Reports: All users can view submitted reports and details  

• View Statistics: Check category distribution and report counts  

• Search & Filter: Easily find reports by keyword or category  

## Security Features

• Encrypted Submission: Reports encrypted before submission  

• Immutable Storage: Reports cannot be tampered with once stored  

• Anonymity by Design: No personal data or identity linked to reports  

• Transparent Aggregation: Statistics verifiable directly on-chain  

## Future Enhancements

• Full Homomorphic Encryption (FHE) integration for secure encrypted computation  

• Threshold-based alerts when certain category counts exceed limits  

• Multi-chain deployment for broader accessibility  

• Mobile-friendly optimized interface  

• DAO governance for community-driven improvements  

Built with ❤️ for a safer and more transparent reporting environment on Ethereum  
