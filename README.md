# RoomFinder – Serverless Listings Platform

A fully serverless rental listings platform built with AWS services, featuring real-time notifications and secure authentication.

## 🚀 Live Demo
[View Live Application](https://d3b4qrml183890.cloudfront.net)

## 🏗️ Architecture

Built a fully serverless rental listings platform using **AWS Lambda**, **API Gateway**, and **DynamoDB**, with **SNS**-based real-time email/SMS notifications.

Automated CI/CD and infrastructure provisioning via **AWS CDK**, implementing secure authentication with **Cognito** and least-privilege IAM policies.

## 🛠️ Tech Stack

- **Backend**: AWS Lambda, API Gateway, DynamoDB
- **Frontend**: React, TypeScript, Vite
- **Infrastructure**: AWS CDK, CloudFormation
- **Authentication**: AWS Cognito
- **Storage**: S3
- **Notifications**: SNS (Email/SMS)
- **Monitoring**: CloudWatch

## 📦 Getting Started

### Prerequisites
- Node.js installed
- AWS CLI configured with credentials
- AWS Account

### Backend Deployment

```bash
cd space-finder
npm install
npm run deploy
```

### Frontend Development

```bash
cd space-finder-frontend
npm install
npm run dev
```

## 📁 Project Structure

```
├── space-finder/          # Backend infrastructure & Lambda functions
│   ├── src/
│   │   ├── infra/        # CDK stacks
│   │   └── services/     # Lambda handlers
│   └── cdk.json
└── space-finder-frontend/ # React frontend
    └── src/
        ├── components/
        └── services/
```

## 🔐 Security Features

- Cognito user authentication with user pools and identity pools
- IAM roles with least-privilege policies
- Secure S3 bucket access for photo uploads
- Admin role-based access control

## 📧 Notifications

Real-time email and SMS notifications powered by AWS SNS for:
- New listing alerts
- Booking confirmations
- System updates
