#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ProductsAppStack } from '../lib/productsApp-stack';
import { EcommerceApiStack } from '../lib/ecommerceAPI-stack';

const app = new cdk.App();

const account = process.env.CDK_ACCOUNT;
const region = process.env.CDK_REGION;

const env: cdk.Environment = {
  account: account || 'default',
  region: region || 'default',
};

const globalTags  = {
  cost: "Serverless Commerce",
  owner: "Carlos Monteiro"
}

const productsAppStack = new ProductsAppStack(app, "ProductsApp", {
  tags: globalTags, 
  env: env
})

const ecommerceApiStack = new EcommerceApiStack(app, "EcommerceApi", {
  productsFetchHandler: productsAppStack.productsFetchHandler,
  productsAdminHandler: productsAppStack.productsAdminHandler,
  tags: globalTags,
  env: env
})

ecommerceApiStack.addDependency(productsAppStack)