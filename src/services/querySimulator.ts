// Query Simulator Service
// Simulates query execution for populated databases

import type { DatasetType, SuggestedQuery, QueryResultColumn } from '../data/sampleDatasets/types';
import {
  getDatasetQueries,
  getQueryResultColumns,
  getQueryResultData,
  findQueryByNaturalLanguage,
  getDataset,
} from '../data/sampleDatasets/registry';

// Query result interface
export interface QueryResult {
  success: boolean;
  query: string;
  sql: string;
  executionTime: number;
  rowCount: number;
  columns: QueryResultColumn[];
  data: unknown[];
  error?: string;
}

// Query history item
export interface QueryHistoryItem {
  id: string;
  query: string;
  sql: string;
  executedAt: Date;
  status: 'success' | 'error';
  rowsReturned: number;
  executionTime: number;
  datasetType: DatasetType;
}

// Generate a random execution time (50-500ms)
function generateExecutionTime(): number {
  return Math.floor(Math.random() * 450) + 50;
}

// Generate a unique query ID
function generateQueryId(): string {
  return `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get suggested queries for a dataset
 */
export function getSuggestedQueries(datasetType: DatasetType): SuggestedQuery[] {
  return getDatasetQueries(datasetType);
}

/**
 * Execute a natural language query against a dataset
 */
export function executeNaturalLanguageQuery(
  datasetType: DatasetType,
  query: string
): QueryResult {
  const startTime = performance.now();

  // Find matching query
  const matchedQuery = findQueryByNaturalLanguage(datasetType, query);

  if (!matchedQuery) {
    return {
      success: false,
      query,
      sql: '',
      executionTime: Math.floor(performance.now() - startTime),
      rowCount: 0,
      columns: [],
      data: [],
      error: `No matching query found for: "${query}". Try one of the suggested queries.`,
    };
  }

  // Get result data
  const columns = getQueryResultColumns(datasetType, matchedQuery.resultKey);
  const data = getQueryResultData(datasetType, matchedQuery.resultKey);

  // Simulate realistic execution time
  const executionTime = generateExecutionTime();

  return {
    success: true,
    query,
    sql: matchedQuery.sql,
    executionTime,
    rowCount: data.length,
    columns,
    data,
  };
}

/**
 * Execute a SQL query against a dataset (simulated)
 */
export function executeSQLQuery(
  datasetType: DatasetType,
  sql: string
): QueryResult {
  const normalizedSQL = sql.toLowerCase().trim();

  // Try to match SQL to a known query
  const queries = getDatasetQueries(datasetType);

  // Look for exact or partial SQL match
  const matchedQuery = queries.find(q => {
    const querySql = q.sql.toLowerCase();
    return querySql === normalizedSQL ||
           normalizedSQL.includes(querySql.substring(0, 50)) ||
           querySql.includes(normalizedSQL.substring(0, 50));
  });

  if (matchedQuery) {
    const columns = getQueryResultColumns(datasetType, matchedQuery.resultKey);
    const data = getQueryResultData(datasetType, matchedQuery.resultKey);

    return {
      success: true,
      query: matchedQuery.naturalLanguage,
      sql,
      executionTime: generateExecutionTime(),
      rowCount: data.length,
      columns,
      data,
    };
  }

  // For unmatched SQL, generate mock results based on query pattern
  const result = generateMockSQLResult(datasetType, sql);
  return result;
}

/**
 * Generate mock results for arbitrary SQL queries
 */
function generateMockSQLResult(datasetType: DatasetType, sql: string): QueryResult {
  const normalizedSQL = sql.toLowerCase();
  const dataset = getDataset(datasetType);

  // Parse the query to understand intent
  const isCount = normalizedSQL.includes('count(');
  const isSum = normalizedSQL.includes('sum(');
  const isAvg = normalizedSQL.includes('avg(');
  const isSelectAll = normalizedSQL.includes('select *');
  const hasLimit = normalizedSQL.includes('limit');
  const hasGroupBy = normalizedSQL.includes('group by');

  // Extract table name if possible
  const tableMatch = normalizedSQL.match(/from\s+(\w+)/);
  const tableName = tableMatch ? tableMatch[1] : null;

  // Generate appropriate mock response
  let columns: QueryResultColumn[] = [];
  let data: unknown[] = [];
  let rowCount = 0;

  if (isCount && !hasGroupBy) {
    // Simple COUNT query
    columns = [{ key: 'count', label: 'Count', type: 'number' }];
    const count = Math.floor(Math.random() * 10000) + 100;
    data = [{ count }];
    rowCount = 1;
  } else if (isSum || isAvg) {
    // Aggregate query
    const aggType = isSum ? 'total' : 'average';
    columns = [{ key: aggType, label: aggType.charAt(0).toUpperCase() + aggType.slice(1), type: 'number' }];
    const value = isSum
      ? Math.floor(Math.random() * 1000000) + 10000
      : Math.floor(Math.random() * 1000) + 10;
    data = [{ [aggType]: value }];
    rowCount = 1;
  } else if (isSelectAll && tableName && dataset) {
    // SELECT * FROM table - get schema and generate rows
    const table = dataset.schema.tables.find(
      t => t.name.toLowerCase() === tableName
    );

    if (table) {
      columns = table.columns.map(col => ({
        key: col.name,
        label: col.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        type: col.type.includes('int') || col.type.includes('decimal') ? 'number' :
              col.type.includes('date') || col.type.includes('timestamp') ? 'date' : 'string',
      }));

      // Generate mock rows
      const limit = hasLimit
        ? parseInt(normalizedSQL.match(/limit\s+(\d+)/)?.[1] || '10')
        : 10;

      data = generateMockRows(columns, Math.min(limit, 50));
      rowCount = data.length;
    } else {
      // Table not found, return generic result
      columns = [{ key: 'message', label: 'Message', type: 'string' }];
      data = [{ message: `Table '${tableName}' not found in schema` }];
      rowCount = 1;
    }
  } else if (hasGroupBy) {
    // GROUP BY query - generate grouped results
    const groupMatch = normalizedSQL.match(/group by\s+(\w+)/);
    const groupColumn = groupMatch ? groupMatch[1] : 'category';

    columns = [
      { key: groupColumn, label: groupColumn.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), type: 'string' },
      { key: 'count', label: 'Count', type: 'number' },
    ];

    if (isSum) {
      columns.push({ key: 'total', label: 'Total', type: 'number' });
    }

    // Generate 5-10 grouped rows
    const numGroups = Math.floor(Math.random() * 6) + 5;
    data = Array.from({ length: numGroups }, (_, i) => ({
      [groupColumn]: `Group ${i + 1}`,
      count: Math.floor(Math.random() * 1000) + 50,
      ...(isSum ? { total: Math.floor(Math.random() * 100000) + 1000 } : {}),
    }));
    rowCount = data.length;
  } else {
    // Default: return a simple result set
    columns = [
      { key: 'id', label: 'ID', type: 'string' },
      { key: 'name', label: 'Name', type: 'string' },
      { key: 'value', label: 'Value', type: 'number' },
      { key: 'created_at', label: 'Created At', type: 'date' },
    ];

    const limit = hasLimit
      ? parseInt(normalizedSQL.match(/limit\s+(\d+)/)?.[1] || '10')
      : 10;

    data = generateMockRows(columns, Math.min(limit, 50));
    rowCount = data.length;
  }

  return {
    success: true,
    query: 'Custom SQL Query',
    sql,
    executionTime: generateExecutionTime(),
    rowCount,
    columns,
    data,
  };
}

/**
 * Generate mock row data based on column definitions
 */
function generateMockRows(columns: QueryResultColumn[], count: number): Record<string, unknown>[] {
  const names = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa'];

  return Array.from({ length: count }, (_, i) => {
    const row: Record<string, unknown> = {};

    for (const col of columns) {
      switch (col.type) {
        case 'number':
          row[col.key] = col.key.includes('id')
            ? i + 1
            : Math.floor(Math.random() * 10000) + 1;
          break;
        case 'date':
          const date = new Date();
          date.setDate(date.getDate() - Math.floor(Math.random() * 365));
          row[col.key] = date.toISOString().split('T')[0];
          break;
        case 'currency':
          row[col.key] = (Math.random() * 1000).toFixed(2);
          break;
        case 'percentage':
          row[col.key] = (Math.random() * 100).toFixed(1);
          break;
        default:
          if (col.key === 'id' || col.key.endsWith('_id')) {
            row[col.key] = `${col.key.replace('_id', '')}-${String(i + 1).padStart(4, '0')}`;
          } else if (col.key === 'name' || col.key.endsWith('_name')) {
            row[col.key] = names[i % names.length] + ' ' + (i + 1);
          } else if (col.key === 'status') {
            row[col.key] = ['active', 'pending', 'completed', 'cancelled'][Math.floor(Math.random() * 4)];
          } else if (col.key === 'email') {
            row[col.key] = `user${i + 1}@example.com`;
          } else {
            row[col.key] = `Value ${i + 1}`;
          }
      }
    }

    return row;
  });
}

/**
 * Create a query history item from a result
 */
export function createHistoryItem(
  result: QueryResult,
  datasetType: DatasetType
): QueryHistoryItem {
  return {
    id: generateQueryId(),
    query: result.query,
    sql: result.sql,
    executedAt: new Date(),
    status: result.success ? 'success' : 'error',
    rowsReturned: result.rowCount,
    executionTime: result.executionTime,
    datasetType,
  };
}

/**
 * Format execution time for display
 */
export function formatExecutionTime(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Generate SQL from natural language (simulated AI response)
 */
export function generateSQLFromNaturalLanguage(
  datasetType: DatasetType,
  query: string
): { sql: string; explanation: string } {
  // Try to find a matching query in the dataset
  const matchedQuery = findQueryByNaturalLanguage(datasetType, query);

  if (matchedQuery) {
    return {
      sql: matchedQuery.sql,
      explanation: matchedQuery.description,
    };
  }

  // Generate a generic SQL based on keywords
  const normalizedQuery = query.toLowerCase();
  const dataset = getDataset(datasetType);

  if (!dataset) {
    return {
      sql: '-- Unable to generate SQL: Dataset not found',
      explanation: 'The specified dataset could not be found.',
    };
  }

  const primaryTable = dataset.schema.tables[0];

  let sql = '';
  let explanation = '';

  if (normalizedQuery.includes('count') || normalizedQuery.includes('how many')) {
    sql = `SELECT COUNT(*) as total\nFROM ${primaryTable.name};`;
    explanation = `Counts all records in the ${primaryTable.displayName} table.`;
  } else if (normalizedQuery.includes('total') || normalizedQuery.includes('sum')) {
    const numericCol = primaryTable.columns.find(c => c.type.includes('decimal') || c.type.includes('int'));
    const colName = numericCol?.name || 'amount';
    sql = `SELECT SUM(${colName}) as total\nFROM ${primaryTable.name};`;
    explanation = `Calculates the sum of ${colName} across all records.`;
  } else if (normalizedQuery.includes('average') || normalizedQuery.includes('avg')) {
    const numericCol = primaryTable.columns.find(c => c.type.includes('decimal') || c.type.includes('int'));
    const colName = numericCol?.name || 'amount';
    sql = `SELECT AVG(${colName}) as average\nFROM ${primaryTable.name};`;
    explanation = `Calculates the average ${colName} across all records.`;
  } else if (normalizedQuery.includes('recent') || normalizedQuery.includes('latest')) {
    const dateCol = primaryTable.columns.find(c => c.type.includes('date') || c.type.includes('timestamp'));
    const dateColName = dateCol?.name || 'created_at';
    sql = `SELECT *\nFROM ${primaryTable.name}\nORDER BY ${dateColName} DESC\nLIMIT 10;`;
    explanation = `Retrieves the 10 most recent records ordered by ${dateColName}.`;
  } else if (normalizedQuery.includes('top') || normalizedQuery.includes('best')) {
    const numericCol = primaryTable.columns.find(c => c.type.includes('decimal') || c.type.includes('int'));
    const colName = numericCol?.name || 'value';
    sql = `SELECT *\nFROM ${primaryTable.name}\nORDER BY ${colName} DESC\nLIMIT 10;`;
    explanation = `Retrieves the top 10 records ordered by ${colName}.`;
  } else {
    // Default: select all with limit
    sql = `SELECT *\nFROM ${primaryTable.name}\nLIMIT 100;`;
    explanation = `Retrieves up to 100 records from the ${primaryTable.displayName} table.`;
  }

  return { sql, explanation };
}
