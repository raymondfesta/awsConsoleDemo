import type { Product } from '../types';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'AWS Lambda Function',
    category: 'Compute',
    price: 0.20,
    stock: 1000,
    status: 'active',
    lastUpdated: '2024-01-15'
  },
  {
    id: '2',
    name: 'Amazon S3 Bucket',
    category: 'Storage',
    price: 0.023,
    stock: 500,
    status: 'active',
    lastUpdated: '2024-01-14'
  },
  {
    id: '3',
    name: 'Amazon EC2 Instance',
    category: 'Compute',
    price: 0.096,
    stock: 250,
    status: 'active',
    lastUpdated: '2024-01-13'
  },
  {
    id: '4',
    name: 'Amazon RDS Database',
    category: 'Database',
    price: 0.115,
    stock: 150,
    status: 'inactive',
    lastUpdated: '2024-01-12'
  },
  {
    id: '5',
    name: 'Amazon CloudFront',
    category: 'Networking',
    price: 0.085,
    stock: 800,
    status: 'active',
    lastUpdated: '2024-01-11'
  },
  {
    id: '6',
    name: 'Amazon DynamoDB',
    category: 'Database',
    price: 0.25,
    stock: 600,
    status: 'active',
    lastUpdated: '2024-01-10'
  },
  {
    id: '7',
    name: 'Amazon SNS',
    category: 'Messaging',
    price: 0.50,
    stock: 400,
    status: 'inactive',
    lastUpdated: '2024-01-09'
  },
  {
    id: '8',
    name: 'Amazon SQS',
    category: 'Messaging',
    price: 0.40,
    stock: 350,
    status: 'active',
    lastUpdated: '2024-01-08'
  }
];
