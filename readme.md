# Spermify

Tired of not knowing who's the dad?  
Tired of not knowing the genes?  
Tired of not knowing the face?  
Chose Spermify  

**Spermify** is a revolutionary decentralized application (dApp) designed to facilitate and regulate sperm donation using blockchain technology. Inspired by the user-friendly interface of dating apps like Tinder, Spermify connects sperm donors and recipients while ensuring privacy, security, and ethical practices.

This is a monorepo containing the frontend and backend of the Spermify app. This POC is made in the context of the [ETHGlobal Ethonline 2024](https://ethglobal.com/events/ethonline2024) hackathon. You can find more details about the project on the [ETHGlobal Showcase](https://ethglobal.com/showcase/spermify-7s9jk).

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technologies](#technologies)
- [Installation](#installation)
- [Usage](#usage)
- [API Integration](#api-integration)
  - [Kinto](#kinto)
  - [Envio](#envio)
  - [XMTP](#xmtp)

## Overview

Spermify leverages blockchain technology to provide a secure, decentralized platform where sperm donors and recipients can connect. The platform ensures transparency, privacy, and ethical practices through secure KYC verification, anonymous communication, and efficient blockchain-based transactions.

## Features

- **Blockchain-Based Trust**: Uses **Kinto** for secure KYC verification.
- **Anonymous Messaging**: Integrated with **XMTP** for decentralized, secure communication between donors and recipients.
- **Efficient Blockchain Queries**: Uses **Envio** to query blockchain data efficiently, avoiding unnecessary transactions.
- **User-Friendly Interface**: Inspired by Tinder, with easy-to-use matching functionality.
- **Modern Web Technologies**: Built using **React (Next.js)** for the frontend and **Node.js with Express** for the backend.

## Technologies

- **Frontend**: React with Next.js
- **Backend**: Node.js, Express.js
- **Blockchain**: Kinto, XMTP, Envio Subgraph
- **Database**: PostgreSQL (or insert your DB of choice)
- **API**: RESTful API
- **Messaging**: XMTP
- **Deployment**: Docker, Kubernetes, and cloud solutions (e.g., AWS, GCP)

## Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/kuurus/zksocial
    cd spermify
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

3. **Configure environment variables:**

   Create a `.env` file in the root directory with the following values:

    ```bash
    DB_HOST=...
    DB_PORT=...
    DB_USER=...
    DB_PASSWORD=...
    DB_NAME=...
    ```

4. **Start the development server:**

    ```bash
    npm run dev
    ```

    The app will be running at `http://localhost:3000`.

## Usage

- Donors can create profiles, undergo KYC verification, and match with potential recipients.
- Recipients can browse donor profiles and communicate anonymously with chosen donors via XMTP.
- The blockchain ensures trust and transparency through Kinto's verification process and Envio's efficient transaction checks.

## API Integration

### Kinto

We use **Kinto** to verify users through a secure KYC process. It ensures that both donors and recipients are authenticated, adding a layer of trust and security to the platform.

### Envio

Envio is used to build a subgraph that queries blockchain data efficiently for wallet creation checks. This optimization ensures fewer gas fees and quicker response times without creating new transactions for each action.

### XMTP

XMTP provides secure, decentralized messaging between donors and recipients. We use this protocol to enable anonymous communication within the app, ensuring privacy while maintaining usability.
