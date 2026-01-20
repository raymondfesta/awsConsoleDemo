import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';
import { RDSClient } from '@aws-sdk/client-rds';
import { RDSDataClient } from '@aws-sdk/client-rds-data';

// AWS Configuration
const awsConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
};

// Bedrock Runtime Client
export const bedrockClient = new BedrockRuntimeClient(awsConfig);

// RDS Client for managing instances and clusters
export const rdsClient = new RDSClient(awsConfig);

// RDS Data Client for executing SQL queries via Data API
export const rdsDataClient = new RDSDataClient(awsConfig);

// Model ID for Bedrock
export const BEDROCK_MODEL_ID = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-opus-4-5-20251101-v1:0';

export { awsConfig };
