import { Router, Request, Response } from 'express';
import {
  executeStatement,
  getTables,
  describeTable,
  listDSQLClusters,
  getDSQLCluster,
} from '../services/dsql.service.js';

const router = Router();

interface QueryRequest {
  resourceArn: string;
  secretArn: string;
  sql: string;
  database?: string;
}

interface TableRequest {
  resourceArn: string;
  secretArn: string;
  database: string;
  schema?: string;
}

/**
 * GET /api/dsql/clusters
 * List all DSQL clusters
 */
router.get('/clusters', async (_req: Request, res: Response) => {
  try {
    const clusters = await listDSQLClusters();
    res.json(clusters);
  } catch (error) {
    console.error('Error listing DSQL clusters:', error);
    res.status(500).json({
      error: 'Failed to list DSQL clusters',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/dsql/clusters/:id
 * Get a specific DSQL cluster
 */
router.get('/clusters/:id', async (req: Request, res: Response) => {
  try {
    const cluster = await getDSQLCluster(req.params.id);
    if (!cluster) {
      res.status(404).json({ error: 'Cluster not found' });
      return;
    }
    res.json(cluster);
  } catch (error) {
    console.error('Error getting DSQL cluster:', error);
    res.status(500).json({
      error: 'Failed to get DSQL cluster',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/dsql/query
 * Execute a SQL query
 */
router.post('/query', async (req: Request<object, object, QueryRequest>, res: Response) => {
  try {
    const { resourceArn, secretArn, sql, database } = req.body;

    if (!resourceArn || !secretArn || !sql) {
      res.status(400).json({
        error: 'Missing required fields: resourceArn, secretArn, sql',
      });
      return;
    }

    const result = await executeStatement(resourceArn, secretArn, sql, database);
    res.json(result);
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).json({
      error: 'Failed to execute query',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/dsql/tables
 * Get list of tables in a database
 */
router.post('/tables', async (req: Request<object, object, TableRequest>, res: Response) => {
  try {
    const { resourceArn, secretArn, database, schema } = req.body;

    if (!resourceArn || !secretArn || !database) {
      res.status(400).json({
        error: 'Missing required fields: resourceArn, secretArn, database',
      });
      return;
    }

    const tables = await getTables(resourceArn, secretArn, database, schema);
    res.json(tables);
  } catch (error) {
    console.error('Error getting tables:', error);
    res.status(500).json({
      error: 'Failed to get tables',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/dsql/describe-table
 * Get schema information for a table
 */
router.post('/describe-table', async (req: Request, res: Response) => {
  try {
    const { resourceArn, secretArn, database, tableName, schema } = req.body;

    if (!resourceArn || !secretArn || !database || !tableName) {
      res.status(400).json({
        error: 'Missing required fields: resourceArn, secretArn, database, tableName',
      });
      return;
    }

    const tableSchema = await describeTable(resourceArn, secretArn, database, tableName, schema);
    res.json(tableSchema);
  } catch (error) {
    console.error('Error describing table:', error);
    res.status(500).json({
      error: 'Failed to describe table',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
