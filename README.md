# Solana Durable Nonces Guide
This repository provides a comprehensive guide and practical codebase on leveraging durable nonces for offline transactions on the Solana network.

## Overview
On Solana, fetching the latest blockhash is a standard procedure to prevent replay attacks. However, in situations requiring offline signatures, like from cold storages or hardware wallets, the blockhash might expire before you can use it. Durable nonces come as a solution to this problem, ensuring transaction validity even in offline scenarios.
## What's Inside?
- Durable Nonce Creation: Understand the creation of a nonce account and how it gets a unique, persistent nonce.
- Offline Transaction Handling: See how to craft transactions using durable nonces, ensuring they remain valid even when signed offline.
- Utility Functions: Dive into helper functions for encoding, decoding, and managing transactions on Solana.
- Getting Started
## Prerequisites
- Basic JavaScript knowledge.
- NodeJS installed.
- Solana CLI Installed.
- Git installed.
## Environment Setup
Follow the steps outlined in the [guide]("https://helius.dev/blog/") to set up your development environment. This includes cloning the repository, installing necessary packages, and setting up wallet configurations.
## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.
