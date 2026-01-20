import { Router, Request, Response } from 'express';
import {
  describeInstances,
  describeClusters,
  createInstance,
  createCluster,
  deleteInstance,
  deleteCluster,
  modifyInstance,
  getEngineVersions,
  getInstanceClasses,
} from '../services/rds.service.js';
import type { CreateInstanceParams, CreateClusterParams } from '../types/index.js';

const router = Router();

// ============ INSTANCES ============

/**
 * GET /api/rds/instances
 * List all RDS instances
 */
router.get('/instances', async (_req: Request, res: Response) => {
  try {
    const instances = await describeInstances();
    res.json(instances);
  } catch (error) {
    console.error('Error listing instances:', error);
    res.status(500).json({
      error: 'Failed to list RDS instances',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/rds/instances/:id
 * Get a specific RDS instance
 */
router.get('/instances/:id', async (req: Request, res: Response) => {
  try {
    const instances = await describeInstances(req.params.id);
    if (instances.length === 0) {
      res.status(404).json({ error: 'Instance not found' });
      return;
    }
    res.json(instances[0]);
  } catch (error) {
    console.error('Error getting instance:', error);
    res.status(500).json({
      error: 'Failed to get RDS instance',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/rds/instances
 * Create a new RDS instance
 */
router.post('/instances', async (req: Request<object, object, CreateInstanceParams>, res: Response) => {
  try {
    const instance = await createInstance(req.body);
    res.status(201).json(instance);
  } catch (error) {
    console.error('Error creating instance:', error);
    res.status(500).json({
      error: 'Failed to create RDS instance',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * PUT /api/rds/instances/:id
 * Modify an RDS instance
 */
router.put('/instances/:id', async (req: Request, res: Response) => {
  try {
    const instance = await modifyInstance(req.params.id, req.body);
    res.json(instance);
  } catch (error) {
    console.error('Error modifying instance:', error);
    res.status(500).json({
      error: 'Failed to modify RDS instance',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * DELETE /api/rds/instances/:id
 * Delete an RDS instance
 */
router.delete('/instances/:id', async (req: Request, res: Response) => {
  try {
    await deleteInstance(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting instance:', error);
    res.status(500).json({
      error: 'Failed to delete RDS instance',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============ CLUSTERS ============

/**
 * GET /api/rds/clusters
 * List all RDS clusters
 */
router.get('/clusters', async (_req: Request, res: Response) => {
  try {
    const clusters = await describeClusters();
    res.json(clusters);
  } catch (error) {
    console.error('Error listing clusters:', error);
    res.status(500).json({
      error: 'Failed to list RDS clusters',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/rds/clusters/:id
 * Get a specific RDS cluster
 */
router.get('/clusters/:id', async (req: Request, res: Response) => {
  try {
    const clusters = await describeClusters(req.params.id);
    if (clusters.length === 0) {
      res.status(404).json({ error: 'Cluster not found' });
      return;
    }
    res.json(clusters[0]);
  } catch (error) {
    console.error('Error getting cluster:', error);
    res.status(500).json({
      error: 'Failed to get RDS cluster',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/rds/clusters
 * Create a new RDS cluster
 */
router.post('/clusters', async (req: Request<object, object, CreateClusterParams>, res: Response) => {
  try {
    const cluster = await createCluster(req.body);
    res.status(201).json(cluster);
  } catch (error) {
    console.error('Error creating cluster:', error);
    res.status(500).json({
      error: 'Failed to create RDS cluster',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * DELETE /api/rds/clusters/:id
 * Delete an RDS cluster
 */
router.delete('/clusters/:id', async (req: Request, res: Response) => {
  try {
    await deleteCluster(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting cluster:', error);
    res.status(500).json({
      error: 'Failed to delete RDS cluster',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============ UTILITIES ============

/**
 * GET /api/rds/engines/:engine/versions
 * Get available versions for an engine
 */
router.get('/engines/:engine/versions', async (req: Request, res: Response) => {
  try {
    const versions = await getEngineVersions(req.params.engine);
    res.json(versions);
  } catch (error) {
    console.error('Error getting engine versions:', error);
    res.status(500).json({
      error: 'Failed to get engine versions',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/rds/engines/:engine/instance-classes
 * Get available instance classes for an engine
 */
router.get('/engines/:engine/instance-classes', async (req: Request, res: Response) => {
  try {
    const classes = await getInstanceClasses(req.params.engine);
    res.json(classes);
  } catch (error) {
    console.error('Error getting instance classes:', error);
    res.status(500).json({
      error: 'Failed to get instance classes',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
