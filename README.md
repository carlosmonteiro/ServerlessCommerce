# Serverless E-commerce with AWS

Welcome to the serverless e-commerce system project! This repository contains the code and configurations needed to deploy a scalable and modern e-commerce platform using exclusively AWS serverless services. The entire infrastructure is managed and documented with AWS CDK using TypeScript.

## Overview

This project aims to provide an easy-to-deploy, scalable, and cost-effective e-commerce solution by leveraging the benefits of serverless architecture and infrastructure as code.

## Technologies Used

- **AWS Lambda**: To execute business logic without server provisioning.
- **AWS API Gateway**: To manage secure and efficient RESTful APIs.
- **AWS DynamoDB**: NoSQL database for data storage.
- **AWS S3**: For static file storage and site resources.
- **AWS CloudFront**: To globally distribute content with low latency.
- **AWS Cognito**: For user authentication and authorization management.
- **AWS CDK (Cloud Development Kit)**: Tool for defining infrastructure as code in TypeScript.

## Prerequisites

- **Node.js**: Ensure you have Node.js installed on your machine to run TypeScript scripts and the AWS CDK.
- **AWS CLI**: Configure AWS CLI with your credentials to access AWS services.
- **AWS CDK**: Install AWS CDK globally using npm:
  ```bash
  npm install -g aws-cdk

## Project Structure

- **/lib**: Contains AWS CDK stacks that define AWS resources.
- **/src**: Source code for Lambda functions written in TypeScript.
- **/bin**: Entry point for the CDK to deploy the application.