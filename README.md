# RoomFinder - Serverless Housing Rental Application

## Overview

**RoomFinder** is a serverless web application designed to streamline the process of finding and managing rental housing rooms. Built with **AWS** and **TypeScript**, this project showcases the power of modern cloud infrastructure, leveraging **AWS CDK** (Cloud Development Kit) to define and deploy resources. The backend is entirely serverless, using **AWS Lambda** for computing, **DynamoDB** for data storage, and **Cognito** for secure user authentication. The front end is built using **React**, integrated seamlessly with AWS services through **AWS Amplify**.

## Key Features

### 1. **Serverless Architecture**
- Fully serverless application using **AWS Lambda** for scalable, event-driven computing.
- **DynamoDB** for fast and flexible NoSQL database solutions, storing room listings with real-time queries and updates.
- **API Gateway** to manage RESTful API endpoints for room management operations.

### 2. **Advanced Authentication**
- Secure user authentication with **AWS Cognito**, featuring user pools, identity pools, and IAM role management for fine-grained access control.
- Support for OAuth integration and scalable user management.

### 3. **Cloud Infrastructure as Code**
- Entire infrastructure is defined using **AWS CDK** and deployed via **AWS CloudFormation** for consistent, scalable deployments.
- Best practices for organizing and managing CDK apps, including custom constructs and reusability.

### 4. **Real-Time Data and File Storage**
- **AWS S3** for scalable and secure file storage, integrated with the application to handle room photos and media files.
- Monitoring stack built using **CloudWatch** and **SNS** for alerting and troubleshooting, with integration for Slack notifications.

### 5. **TypeScript Across the Stack**
- TypeScript used for defining cloud infrastructure with CDK, writing Lambda functions for room management logic, and developing the front-end UI with **React**.
- Unified development experience, reducing complexity by using a single language across all layers.

## Room Management Features

- **Room Listings**: Create, view, update, and delete room rental listings
- **Detailed Information**: Track rent, bedrooms, bathrooms, square footage, amenities
- **Contact Management**: Store landlord/property manager contact information
- **Availability Tracking**: Monitor room availability status and dates
- **Photo Upload**: Upload and display room photos via S3 integration
- **Search & Filter**: Find rooms based on location, price, and features

## Technologies Used

- **Frontend**: React.js, AWS Amplify
- **Backend**: AWS Lambda, DynamoDB, API Gateway, S3
- **Infrastructure**: AWS CDK, CloudFormation
- **Authentication**: AWS Cognito
- **Monitoring**: CloudWatch, SNS, X-Ray
- **Testing**: Jest for CDK unit testing and validation

## Walkthrough
![Screenshot 2024-10-05 at 3 26 55 PM](https://github.com/user-attachments/assets/88621ed2-b105-4d00-8602-4a20c05b8607)
![walkthrough](https://github.com/user-attachments/assets/59f3079e-cf9a-4554-941f-f8a846dca3fc)

