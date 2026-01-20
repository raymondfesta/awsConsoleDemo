import {
  DescribeDBInstancesCommand,
  DescribeDBClustersCommand,
  CreateDBInstanceCommand,
  CreateDBClusterCommand,
  DeleteDBInstanceCommand,
  DeleteDBClusterCommand,
  ModifyDBInstanceCommand,
  DescribeDBEngineVersionsCommand,
  DescribeOrderableDBInstanceOptionsCommand,
} from '@aws-sdk/client-rds';
import { rdsClient } from '../config/aws.js';
import type { RDSInstance, RDSCluster, CreateInstanceParams, CreateClusterParams } from '../types/index.js';

/**
 * Get all RDS instances
 */
export async function describeInstances(instanceId?: string): Promise<RDSInstance[]> {
  const command = new DescribeDBInstancesCommand(
    instanceId ? { DBInstanceIdentifier: instanceId } : {}
  );

  const response = await rdsClient.send(command);

  return (response.DBInstances || []).map(instance => ({
    id: instance.DBInstanceIdentifier || '',
    name: instance.DBInstanceIdentifier || '',
    engine: instance.Engine || '',
    engineVersion: instance.EngineVersion || '',
    instanceClass: instance.DBInstanceClass || '',
    status: instance.DBInstanceStatus || '',
    endpoint: instance.Endpoint?.Address,
    port: instance.Endpoint?.Port,
    region: instance.AvailabilityZone?.slice(0, -1) || '',
    storage: instance.AllocatedStorage || 0,
    multiAZ: instance.MultiAZ || false,
    createdAt: instance.InstanceCreateTime || new Date(),
  }));
}

/**
 * Get all RDS clusters
 */
export async function describeClusters(clusterId?: string): Promise<RDSCluster[]> {
  const command = new DescribeDBClustersCommand(
    clusterId ? { DBClusterIdentifier: clusterId } : {}
  );

  const response = await rdsClient.send(command);

  return (response.DBClusters || []).map(cluster => ({
    id: cluster.DBClusterIdentifier || '',
    name: cluster.DBClusterIdentifier || '',
    engine: cluster.Engine || '',
    engineVersion: cluster.EngineVersion || '',
    status: cluster.Status || '',
    endpoint: cluster.Endpoint,
    readerEndpoint: cluster.ReaderEndpoint,
    port: cluster.Port,
    region: cluster.AvailabilityZones?.[0]?.slice(0, -1) || '',
    instances: cluster.DBClusterMembers?.map(m => m.DBInstanceIdentifier || '') || [],
    createdAt: cluster.ClusterCreateTime || new Date(),
  }));
}

/**
 * Create a new RDS instance
 */
export async function createInstance(params: CreateInstanceParams): Promise<RDSInstance> {
  const command = new CreateDBInstanceCommand({
    DBInstanceIdentifier: params.instanceIdentifier,
    DBInstanceClass: params.instanceClass,
    Engine: params.engine,
    EngineVersion: params.engineVersion,
    MasterUsername: params.masterUsername,
    MasterUserPassword: params.masterPassword,
    AllocatedStorage: params.allocatedStorage,
    MultiAZ: params.multiAZ,
    PubliclyAccessible: params.publiclyAccessible,
  });

  const response = await rdsClient.send(command);
  const instance = response.DBInstance;

  return {
    id: instance?.DBInstanceIdentifier || '',
    name: instance?.DBInstanceIdentifier || '',
    engine: instance?.Engine || '',
    engineVersion: instance?.EngineVersion || '',
    instanceClass: instance?.DBInstanceClass || '',
    status: instance?.DBInstanceStatus || 'creating',
    endpoint: instance?.Endpoint?.Address,
    port: instance?.Endpoint?.Port,
    region: instance?.AvailabilityZone?.slice(0, -1) || '',
    storage: instance?.AllocatedStorage || 0,
    multiAZ: instance?.MultiAZ || false,
    createdAt: instance?.InstanceCreateTime || new Date(),
  };
}

/**
 * Create a new RDS cluster
 */
export async function createCluster(params: CreateClusterParams): Promise<RDSCluster> {
  const command = new CreateDBClusterCommand({
    DBClusterIdentifier: params.clusterIdentifier,
    Engine: params.engine,
    EngineVersion: params.engineVersion,
    MasterUsername: params.masterUsername,
    MasterUserPassword: params.masterPassword,
    DatabaseName: params.databaseName,
  });

  const response = await rdsClient.send(command);
  const cluster = response.DBCluster;

  return {
    id: cluster?.DBClusterIdentifier || '',
    name: cluster?.DBClusterIdentifier || '',
    engine: cluster?.Engine || '',
    engineVersion: cluster?.EngineVersion || '',
    status: cluster?.Status || 'creating',
    endpoint: cluster?.Endpoint,
    readerEndpoint: cluster?.ReaderEndpoint,
    port: cluster?.Port,
    region: cluster?.AvailabilityZones?.[0]?.slice(0, -1) || '',
    instances: [],
    createdAt: cluster?.ClusterCreateTime || new Date(),
  };
}

/**
 * Delete an RDS instance
 */
export async function deleteInstance(instanceId: string, skipFinalSnapshot = true): Promise<void> {
  const command = new DeleteDBInstanceCommand({
    DBInstanceIdentifier: instanceId,
    SkipFinalSnapshot: skipFinalSnapshot,
  });

  await rdsClient.send(command);
}

/**
 * Delete an RDS cluster
 */
export async function deleteCluster(clusterId: string, skipFinalSnapshot = true): Promise<void> {
  const command = new DeleteDBClusterCommand({
    DBClusterIdentifier: clusterId,
    SkipFinalSnapshot: skipFinalSnapshot,
  });

  await rdsClient.send(command);
}

/**
 * Modify an RDS instance
 */
export async function modifyInstance(
  instanceId: string,
  params: Partial<Pick<CreateInstanceParams, 'instanceClass' | 'allocatedStorage' | 'multiAZ'>>
): Promise<RDSInstance> {
  const command = new ModifyDBInstanceCommand({
    DBInstanceIdentifier: instanceId,
    DBInstanceClass: params.instanceClass,
    AllocatedStorage: params.allocatedStorage,
    MultiAZ: params.multiAZ,
    ApplyImmediately: true,
  });

  const response = await rdsClient.send(command);
  const instance = response.DBInstance;

  return {
    id: instance?.DBInstanceIdentifier || '',
    name: instance?.DBInstanceIdentifier || '',
    engine: instance?.Engine || '',
    engineVersion: instance?.EngineVersion || '',
    instanceClass: instance?.DBInstanceClass || '',
    status: instance?.DBInstanceStatus || '',
    endpoint: instance?.Endpoint?.Address,
    port: instance?.Endpoint?.Port,
    region: instance?.AvailabilityZone?.slice(0, -1) || '',
    storage: instance?.AllocatedStorage || 0,
    multiAZ: instance?.MultiAZ || false,
    createdAt: instance?.InstanceCreateTime || new Date(),
  };
}

/**
 * Get available engine versions
 */
export async function getEngineVersions(engine: string): Promise<string[]> {
  const command = new DescribeDBEngineVersionsCommand({
    Engine: engine,
  });

  const response = await rdsClient.send(command);

  return (response.DBEngineVersions || [])
    .map(v => v.EngineVersion || '')
    .filter(Boolean);
}

/**
 * Get available instance classes for an engine
 */
export async function getInstanceClasses(engine: string): Promise<string[]> {
  const command = new DescribeOrderableDBInstanceOptionsCommand({
    Engine: engine,
  });

  const response = await rdsClient.send(command);

  const classes = new Set<string>();
  (response.OrderableDBInstanceOptions || []).forEach(opt => {
    if (opt.DBInstanceClass) {
      classes.add(opt.DBInstanceClass);
    }
  });

  return Array.from(classes).sort();
}

export default {
  describeInstances,
  describeClusters,
  createInstance,
  createCluster,
  deleteInstance,
  deleteCluster,
  modifyInstance,
  getEngineVersions,
  getInstanceClasses,
};
