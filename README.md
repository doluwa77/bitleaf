# Bitleaf

A decentralized business loan platform that empowers small business owners with fair, transparent financing — and enables global lenders to directly support real-world entrepreneurship, all on-chain.

---

## Overview

Bitleaf consists of ten smart contracts that together form a trustless, reputation-driven ecosystem for small business financing:

1. **Identity & Reputation Contract** – Establishes borrower identities and tracks repayment history.
2. **Loan Request Contract** – Enables entrepreneurs to post loan requests with custom terms.
3. **Lender Match Contract** – Matches lenders to loan requests based on criteria and availability.
4. **Loan Agreement Contract** – Secures loan terms and handles disbursement and repayment logic.
5. **Collateral Vault Contract** – Holds and releases optional tokenized collateral.
6. **Repayment Schedule Contract** – Automates interest tracking, due dates, and payment logging.
7. **Penalty & Default Resolver Contract** – Applies penalties and flags borrowers in default.
8. **Dispute Resolution DAO Contract** – Handles arbitration through community voting.
9. **Liquidity Pool Contract** – Allows passive lenders to fund pooled loans and earn yield.
10. **Governance Contract** – Allows token holders to manage platform rules and parameters.

---

## Features

- **On-chain borrower identity and credit scoring**  
- **Loan listing marketplace** with custom terms  
- **Smart contract-enforced loan agreements**  
- **Tokenized collateral and escrow logic**  
- **Automatic interest and repayment tracking**  
- **Penalty and default management**  
- **DAO-based dispute resolution**  
- **Lender liquidity pool with shared returns**  
- **Decentralized governance of protocol rules**  
- **Cross-border lending via stablecoins (USDC, DAI, etc.)**

---

## Smart Contracts

### Identity & Reputation Contract
- Register borrower DID profiles
- Track repayment history, defaults, and scores
- Integrate with third-party credit scoring

### Loan Request Contract
- Submit loan requests with amount, duration, and rate
- View open borrower requests
- Cancel or modify pending requests

### Lender Match Contract
- Match lenders to open requests based on filters
- Reserve lender funds in escrow
- Confirm match prior to disbursement

### Loan Agreement Contract
- Immutable loan terms once matched
- Disburse funds from lender to borrower
- Emit repayment and settlement events

### Collateral Vault Contract
- Optional token/NFT collateral support
- Escrow logic tied to loan agreement
- Unlock on full repayment or seize on default

### Repayment Schedule Contract
- Calculate interest dynamically
- Track due dates and received payments
- Trigger penalties on late/missed payments

### Penalty & Default Resolver Contract
- Apply late fees
- Flag borrower profiles
- Initiate collateral liquidation

### Dispute Resolution DAO Contract
- Submit and vote on loan disputes
- Off-chain evidence reference with on-chain verdicts
- Slashing and staking logic for arbitration

### Liquidity Pool Contract
- Passive capital contribution to loan pool
- Pro-rata distribution of loan interest
- Risk pool isolation and limits

### Governance Contract
- Token-weighted voting
- Adjust lending terms, risk factors, collateral types
- Upgrade contract permissions and treasury rules

---

## Installation

1. Install [Clarinet CLI](https://docs.hiro.so/clarinet/getting-started)
2. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/bitleaf.git
   ```
3. Run tests:
    ```bash
    npm test
    ```
4. Deploy contracts:
    ```bash
    clarinet deploy
    ```

## Usage

Each smart contract serves a core role in the loan lifecycle. They can be composed together or used modularly depending on your application’s needs.

Refer to the individual contract documentation in /contracts/ for entrypoints, variables, and usage examples.

## License

MIT License