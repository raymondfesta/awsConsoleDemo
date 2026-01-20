import { ExecuteStatementCommand } from '@aws-sdk/client-rds-data';
import { rdsDataClient } from '../config/aws.js';
import type { SQLQueryResult, TableInfo, TableSchema, ColumnInfo } from '../types/index.js';

// Note: Aurora DSQL uses the RDS Data API for SQL execution
// For cluster management, you would use the DSQL client when available

/**
 * Execute a SQL statement against Aurora DSQL
 */
export async function executeStatement(
  resourceArn: string,
  secretArn: string,
  sql: string,
  database?: string
): Promise<SQLQueryResult> {
  const command = new ExecuteStatementCommand({
    resourceArn,
    secretArn,
    sql,
    database,
    includeResultMetadata: true,
  });

  const response = await rdsDataClient.send(command);

  // Extract column names from metadata
  const columns = (response.columnMetadata || []).map(col => col.name || '');

  // Convert records to row objects
  const rows = (response.records || []).map(record => {
    const row: Record<string, unknown> = {};
    record.forEach((field, index) => {
      const columnName = columns[index] || `col${index}`;
      // Extract value from the field based on its type
      if (field.stringValue !== undefined) {
        row[columnName] = field.stringValue;
      } else if (field.longValue !== undefined) {
        row[columnName] = field.longValue;
      } else if (field.doubleValue !== undefined) {
        row[columnName] = field.doubleValue;
      } else if (field.booleanValue !== undefined) {
        row[columnName] = field.booleanValue;
      } else if (field.blobValue !== undefined) {
        row[columnName] = '[BLOB]';
      } else if (field.isNull) {
        row[columnName] = null;
      } else {
        row[columnName] = field.stringValue ?? null;
      }
    });
    return row;
  });

  return {
    columns,
    rows,
    rowCount: response.numberOfRecordsUpdated ?? rows.length,
  };
}

/**
 * Get list of tables in a database
 */
export async function getTables(
  resourceArn: string,
  secretArn: string,
  database: string,
  schema = 'public'
): Promise<TableInfo[]> {
  const sql = `
    SELECT table_name, table_schema
    FROM information_schema.tables
    WHERE table_schema = '${schema}'
    AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `;

  const result = await executeStatement(resourceArn, secretArn, sql, database);

  return result.rows.map(row => ({
    name: row.table_name as string,
    schema: row.table_schema as string,
  }));
}

/**
 * Get schema information for a table
 */
export async function describeTable(
  resourceArn: string,
  secretArn: string,
  database: string,
  tableName: string,
  schema = 'public'
): Promise<TableSchema> {
  const sql = `
    SELECT
      c.column_name,
      c.data_type,
      c.is_nullable,
      CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END as is_primary_key
    FROM information_schema.columns c
    LEFT JOIN (
      SELECT kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_schema = '${schema}'
        AND tc.table_name = '${tableName}'
        AND tc.constraint_type = 'PRIMARY KEY'
    ) pk ON c.column_name = pk.column_name
    WHERE c.table_schema = '${schema}'
      AND c.table_name = '${tableName}'
    ORDER BY c.ordinal_position
  `;

  const result = await executeStatement(resourceArn, secretArn, sql, database);

  const columns: ColumnInfo[] = result.rows.map(row => ({
    name: row.column_name as string,
    type: row.data_type as string,
    nullable: row.is_nullable === 'YES',
    primaryKey: row.is_primary_key as boolean,
  }));

  return {
    name: tableName,
    columns,
  };
}

/**
 * Execute a batch of SQL statements
 */
export async function batchExecute(
  resourceArn: string,
  secretArn: string,
  statements: string[],
  database?: string
): Promise<SQLQueryResult[]> {
  const results: SQLQueryResult[] = [];

  for (const sql of statements) {
    const result = await executeStatement(resourceArn, secretArn, sql, database);
    results.push(result);
  }

  return results;
}

// Mock DSQL cluster operations (until official SDK is available)
export interface MockDSQLCluster {
  id: string;
  arn: string;
  status: string;
  endpoint: string;
  createdAt: Date;
}

const mockClusters: MockDSQLCluster[] = [
  {
    id: 'dsql-demo-cluster',
    arn: 'arn:aws:dsql:us-east-1:123456789012:cluster/dsql-demo-cluster',
    status: 'available',
    endpoint: 'dsql-demo-cluster.dsql.us-east-1.on.aws',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
];

export async function listDSQLClusters(): Promise<MockDSQLCluster[]> {
  // In production, this would call the DSQL API
  return mockClusters;
}

export async function getDSQLCluster(clusterId: string): Promise<MockDSQLCluster | null> {
  // First check if cluster exists in mock data
  const existingCluster = mockClusters.find(c => c.id === clusterId);
  if (existingCluster) {
    return existingCluster;
  }

  // For demo purposes, return a dynamically generated cluster
  // This allows locally created databases to display properly
  return {
    id: clusterId,
    arn: `arn:aws:dsql:us-east-1:123456789012:cluster/${clusterId}`,
    status: 'available',
    endpoint: `${clusterId}.dsql.us-east-1.on.aws`,
    createdAt: new Date(),
  };
}

export default {
  executeStatement,
  getTables,
  describeTable,
  batchExecute,
  listDSQLClusters,
  getDSQLCluster,
};
