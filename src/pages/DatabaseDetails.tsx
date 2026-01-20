import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Tabs from '@cloudscape-design/components/tabs';
import Button from '@cloudscape-design/components/button';
import CopyToClipboard from '@cloudscape-design/components/copy-to-clipboard';
import Spinner from '@cloudscape-design/components/spinner';
import Alert from '@cloudscape-design/components/alert';
import ContentLayout from '@cloudscape-design/components/content-layout';
import ButtonDropdown from '@cloudscape-design/components/button-dropdown';
import { dsqlApi, rdsApi, type DSQLCluster, type RDSCluster } from '../services/api';
import { useChatContext } from '../context/ChatContext';
import { useAppStore } from '../context/AppContext';
import ConnectionsTab from '../components/database/ConnectionsTab';
import QueriesTab from '../components/database/QueriesTab';
import PopulateDataPanel from '../components/database/PopulateDataPanel';
import type { DatasetType } from '../data/sampleDatasets/types';

// Format date helper
function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Get status indicator type
function getStatusType(status: string): 'success' | 'warning' | 'error' | 'loading' {
  const s = status.toLowerCase();
  if (s === 'active' || s === 'available') return 'success';
  if (s === 'creating' || s === 'modifying') return 'loading';
  if (s === 'stopped' || s === 'stopping') return 'warning';
  if (s === 'error' || s === 'failed' || s === 'deleting') return 'error';
  return 'loading';
}

// DSQL Details View Component
interface DSQLDetailsViewProps {
  cluster: DSQLCluster;
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  isPopulated: boolean;
  populatedData?: ReturnType<typeof useAppStore.getState>['populatedDatabases'][string];
  onPopulate: (datasetType: DatasetType) => void;
  onClearData: () => void;
}

function DSQLDetailsView({ cluster, activeTabId, onTabChange, isPopulated, populatedData, onPopulate, onClearData }: DSQLDetailsViewProps) {
  // Extract region from ARN
  const arnParts = cluster.arn.split(':');
  const region = arnParts[3] || 'us-east-1';

  return (
    <SpaceBetween size="l">
      {/* Cluster Overview - moved outside tabs */}
      <Container header={<Header variant="h2">Cluster overview</Header>}>
        <ColumnLayout columns={4} variant="text-grid">
          <div>
            <Box color="text-body-secondary" fontSize="body-s">Status</Box>
            <StatusIndicator type={getStatusType(cluster.status)}>
              {cluster.status}
            </StatusIndicator>
          </div>
          <div>
            <Box color="text-body-secondary" fontSize="body-s">Engine</Box>
            <Box>Aurora DSQL</Box>
          </div>
          <div>
            <Box color="text-body-secondary" fontSize="body-s">Region</Box>
            <Box>{region}</Box>
          </div>
          <div>
            <Box color="text-body-secondary" fontSize="body-s">Endpoint</Box>
            <CopyToClipboard
              copyButtonAriaLabel="Copy endpoint"
              copyErrorText="Endpoint failed to copy"
              copySuccessText="Endpoint copied"
              textToCopy={cluster.endpoint}
              variant="inline"
            />
          </div>
        </ColumnLayout>
      </Container>

      {/* Cluster Configuration - moved outside tabs */}
      <Container header={<Header variant="h3">Cluster configuration</Header>}>
        <ColumnLayout columns={3} variant="text-grid">
          <div>
            <Box color="text-body-secondary" fontSize="body-s">Cluster ID</Box>
            <CopyToClipboard
              copyButtonAriaLabel="Copy cluster ID"
              copyErrorText="ID failed to copy"
              copySuccessText="ID copied"
              textToCopy={cluster.id}
              variant="inline"
            />
          </div>
          <div>
            <Box color="text-body-secondary" fontSize="body-s">ARN</Box>
            <CopyToClipboard
              copyButtonAriaLabel="Copy ARN"
              copyErrorText="ARN failed to copy"
              copySuccessText="ARN copied"
              textToCopy={cluster.arn}
              variant="inline"
            />
          </div>
          <div>
            <Box color="text-body-secondary" fontSize="body-s">Created</Box>
            <Box>{formatDate(new Date(cluster.createdAt))}</Box>
          </div>
        </ColumnLayout>
      </Container>

      {/* Tabs - Details tab removed */}
      <Tabs
        activeTabId={activeTabId}
        onChange={({ detail }) => onTabChange(detail.activeTabId)}
        tabs={[
          {
            label: "Connections",
            id: "connections",
            content: (
              <ConnectionsTab
                databaseName={cluster.id}
                endpoint={cluster.endpoint}
                region={region}
                onSelectQueriesTab={() => onTabChange('queries')}
              />
            ),
          },
          {
            label: "Schemas",
            id: "schemas",
            content: (
              <Container>
                <Box textAlign="center" color="text-body-secondary" padding="l">
                  Schema information will be available once connected to the database.
                </Box>
              </Container>
            ),
          },
          {
            label: "Queries",
            id: "queries",
            content: <QueriesTab databaseName={cluster.id} />,
          },
          {
            label: "Monitoring",
            id: "monitoring",
            content: (
              <Container>
                <Box textAlign="center" color="text-body-secondary" padding="l">
                  Monitoring data will appear here once the database has been running.
                </Box>
              </Container>
            ),
          },
          {
            label: "Data",
            id: "data",
            content: (
              <PopulateDataPanel
                databaseId={cluster.id}
                databaseName={cluster.id}
                isPopulated={isPopulated}
                currentDataset={populatedData}
                onPopulate={onPopulate}
                onClear={onClearData}
              />
            ),
          },
        ]}
      />
    </SpaceBetween>
  );
}

// RDS Details View Component
interface RDSDetailsViewProps {
  cluster: RDSCluster;
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  isPopulated: boolean;
  populatedData?: ReturnType<typeof useAppStore.getState>['populatedDatabases'][string];
  onPopulate: (datasetType: DatasetType) => void;
  onClearData: () => void;
}

function RDSDetailsView({ cluster, activeTabId, onTabChange, isPopulated, populatedData, onPopulate, onClearData }: RDSDetailsViewProps) {
  return (
    <SpaceBetween size="l">
      {/* Cluster Overview - moved outside tabs */}
      <Container header={<Header variant="h2">Cluster overview</Header>}>
        <ColumnLayout columns={4} variant="text-grid">
          <div>
            <Box color="text-body-secondary" fontSize="body-s">Status</Box>
            <StatusIndicator type={getStatusType(cluster.status)}>
              {cluster.status}
            </StatusIndicator>
          </div>
          <div>
            <Box color="text-body-secondary" fontSize="body-s">Engine</Box>
            <Box>{cluster.engine} {cluster.engineVersion}</Box>
          </div>
          <div>
            <Box color="text-body-secondary" fontSize="body-s">Region</Box>
            <Box>{cluster.region}</Box>
          </div>
          <div>
            <Box color="text-body-secondary" fontSize="body-s">Endpoint</Box>
            {cluster.endpoint ? (
              <CopyToClipboard
                copyButtonAriaLabel="Copy endpoint"
                copyErrorText="Endpoint failed to copy"
                copySuccessText="Endpoint copied"
                textToCopy={cluster.endpoint}
                variant="inline"
              />
            ) : (
              <Box>-</Box>
            )}
          </div>
        </ColumnLayout>
      </Container>

      {/* Cluster Configuration - moved outside tabs */}
      <Container header={<Header variant="h3">Cluster configuration</Header>}>
        <ColumnLayout columns={4} variant="text-grid">
          <div>
            <Box color="text-body-secondary" fontSize="body-s">Cluster ID</Box>
            <CopyToClipboard
              copyButtonAriaLabel="Copy cluster ID"
              copyErrorText="ID failed to copy"
              copySuccessText="ID copied"
              textToCopy={cluster.id}
              variant="inline"
            />
          </div>
          <div>
            <Box color="text-body-secondary" fontSize="body-s">Engine</Box>
            <Box>{cluster.engine}</Box>
          </div>
          <div>
            <Box color="text-body-secondary" fontSize="body-s">Engine version</Box>
            <Box>{cluster.engineVersion}</Box>
          </div>
          <div>
            <Box color="text-body-secondary" fontSize="body-s">Created</Box>
            <Box>{formatDate(new Date(cluster.createdAt))}</Box>
          </div>
        </ColumnLayout>
      </Container>

      {/* Instances - moved outside tabs */}
      {cluster.instances && cluster.instances.length > 0 && (
        <Container header={<Header variant="h3">Instances</Header>}>
          <ColumnLayout columns={4} variant="text-grid">
            {cluster.instances.map((instanceId, index) => (
              <div key={instanceId}>
                <Box color="text-body-secondary" fontSize="body-s">Instance {index + 1}</Box>
                <Box>{instanceId}</Box>
              </div>
            ))}
          </ColumnLayout>
        </Container>
      )}

      {/* Tabs - Details tab removed */}
      <Tabs
        activeTabId={activeTabId}
        onChange={({ detail }) => onTabChange(detail.activeTabId)}
        tabs={[
          {
            label: "Connections",
            id: "connections",
            content: (
              <ConnectionsTab
                databaseName={cluster.name}
                endpoint={cluster.endpoint}
                region={cluster.region}
                onSelectQueriesTab={() => onTabChange('queries')}
              />
            ),
          },
          {
            label: "Schemas",
            id: "schemas",
            content: (
              <Container>
                <Box textAlign="center" color="text-body-secondary" padding="l">
                  Schema information will be available once connected to the database.
                </Box>
              </Container>
            ),
          },
          {
            label: "Queries",
            id: "queries",
            content: <QueriesTab databaseName={cluster.name} />,
          },
          {
            label: "Monitoring",
            id: "monitoring",
            content: (
              <Container>
                <Box textAlign="center" color="text-body-secondary" padding="l">
                  Monitoring data will appear here once the database has been running.
                </Box>
              </Container>
            ),
          },
          {
            label: "Data",
            id: "data",
            content: (
              <PopulateDataPanel
                databaseId={cluster.id}
                databaseName={cluster.name}
                isPopulated={isPopulated}
                currentDataset={populatedData}
                onPopulate={onPopulate}
                onClear={onClearData}
              />
            ),
          },
        ]}
      />
    </SpaceBetween>
  );
}

export default function DatabaseDetails() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const id = searchParams.get('id');
  const type = searchParams.get('type') as 'dsql' | 'rds' | null;

  const [database, setDatabase] = useState<DSQLCluster | RDSCluster | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTabId, setActiveTabId] = useState('connections');

  // Get creation tracking state from ChatContext
  const { creationStatus, createdDatabaseId, onCreationComplete, clearCreationState } = useChatContext();
  const { databases: storeDatabases, updateDatabase, populatedDatabases, populateDatabase, clearDatabaseData } = useAppStore();

  // Get populated data for this database
  const populatedData = id ? populatedDatabases[id] : undefined;
  const isPopulated = !!populatedData;

  // Handlers for data population
  const handlePopulate = useCallback((datasetType: DatasetType) => {
    if (id) {
      populateDatabase(id, datasetType);
    }
  }, [id, populateDatabase]);

  const handleClearData = useCallback(() => {
    if (id) {
      clearDatabaseData(id);
    }
  }, [id, clearDatabaseData]);

  // Check if this is the database being created
  const isCreating = creationStatus === 'creating' && id === createdDatabaseId;

  // Memoized completion handler
  const handleCreationComplete = useCallback(() => {
    if (id) {
      // Update database status in the store
      updateDatabase(id, { status: 'active' });
      // Trigger completion callback (shows flashbar)
      onCreationComplete();
    }
  }, [id, updateDatabase, onCreationComplete]);

  // Polling effect for creation status
  useEffect(() => {
    if (!isCreating || !id || !type) return;

    // Simulate creation completion after 8 seconds (for demo purposes)
    // In production, this would poll the actual API
    const creationTimeout = setTimeout(() => {
      handleCreationComplete();
    }, 8000);

    // Also set up actual polling interval for real API checks
    const pollInterval = setInterval(async () => {
      try {
        let cluster: DSQLCluster | RDSCluster | undefined;
        if (type === 'dsql') {
          cluster = await dsqlApi.getCluster(id);
        } else if (type === 'rds') {
          cluster = await rdsApi.getCluster(id);
        }

        if (cluster) {
          setDatabase(cluster);

          // Check if creation completed
          const status = cluster.status.toLowerCase();
          if (status === 'active' || status === 'available') {
            clearInterval(pollInterval);
            clearTimeout(creationTimeout);
            handleCreationComplete();
          }
        }
      } catch {
        // Ignore errors during polling - database might not exist in API yet
      }
    }, 5000);

    return () => {
      clearInterval(pollInterval);
      clearTimeout(creationTimeout);
    };
  }, [isCreating, id, type, handleCreationComplete]);

  // Clean up creation state when navigating away
  useEffect(() => {
    return () => {
      if (creationStatus === 'completed') {
        clearCreationState();
      }
    };
  }, [creationStatus, clearCreationState]);

  // Fetch database on mount
  useEffect(() => {
    const fetchDatabase = async () => {
      if (!id || !type) {
        setError('Missing database ID or type');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        if (type === 'dsql') {
          const cluster = await dsqlApi.getCluster(id);
          setDatabase(cluster);
        } else if (type === 'rds') {
          const cluster = await rdsApi.getCluster(id);
          setDatabase(cluster);
        } else {
          setError('Invalid database type');
        }
      } catch {
        // API may not be available - try to use local store data
        const localDb = storeDatabases.find(db => db.id === id);
        if (localDb) {
          // Convert local store database to DSQLCluster format
          setDatabase({
            id: localDb.id,
            arn: `arn:aws:dsql:${localDb.region}:123456789:cluster/${localDb.id}`,
            status: localDb.status === 'active' ? 'ACTIVE' : localDb.status.toUpperCase(),
            endpoint: localDb.endpoint || `${localDb.id}.dsql.${localDb.region}.on.aws`,
            createdAt: localDb.createdAt,
          } as DSQLCluster);
        } else if (isCreating) {
          // If we're in creation mode, use placeholder data
          setDatabase({
            id: id,
            arn: `arn:aws:dsql:us-east-1:123456789:cluster/${id}`,
            status: 'creating',
            endpoint: `${id}.dsql.us-east-1.on.aws`,
            createdAt: new Date(),
          } as DSQLCluster);
        } else {
          setError('Database not found. The backend API may not be available.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDatabase();
  }, [id, type, isCreating]);

  // Get database name for header
  const getDatabaseName = () => {
    if (!database) return 'Database Details';
    if (type === 'dsql') return (database as DSQLCluster).id;
    return (database as RDSCluster).name;
  };

  // Loading state (skip if we're in creation mode with placeholder data)
  if (loading && !isCreating) {
    return (
      <ContentLayout
        defaultPadding
        header={<Header variant="h1">Database Details</Header>}
      >
        <Box textAlign="center" padding="xxl">
          <Spinner size="large" />
          <Box variant="p" padding={{ top: 's' }}>Loading database details...</Box>
        </Box>
      </ContentLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <ContentLayout
        defaultPadding
        header={<Header variant="h1">Database Details</Header>}
      >
        <Alert
          type="error"
          header="Error loading database"
          action={<Button onClick={() => navigate('/databases')}>Back to databases</Button>}
        >
          {error}
        </Alert>
      </ContentLayout>
    );
  }

  // No database found
  if (!database) {
    return (
      <ContentLayout
        defaultPadding
        header={<Header variant="h1">Database Details</Header>}
      >
        <Alert
          type="warning"
          header="Database not found"
          action={<Button onClick={() => navigate('/databases')}>Back to databases</Button>}
        >
          The requested database could not be found.
        </Alert>
      </ContentLayout>
    );
  }

  // Get engine info for subtitle
  const getEngineInfo = () => {
    if (!database) return '';
    if (type === 'dsql') return 'Aurora DSQL';
    const rds = database as RDSCluster;
    return `${rds.engine || 'Aurora PostgreSQL'} • ${rds.region || 'us-east-1'}`;
  };

  return (
    <ContentLayout
      defaultPadding
      header={
        <Header
          variant="h1"
          description={
            <SpaceBetween direction="horizontal" size="xs" alignItems="center">
              <StatusIndicator type={database ? getStatusType(database.status) : 'loading'}>
                {database?.status || 'Loading'}
              </StatusIndicator>
              <span>{getEngineInfo()}</span>
            </SpaceBetween>
          }
          actions={
            <ButtonDropdown
              variant="primary"
              items={[
                { id: 'edit', text: 'Edit' },
                { id: 'stop', text: 'Stop' },
                { id: 'reboot', text: 'Reboot' },
                { id: 'delete', text: 'Delete', disabled: false },
              ]}
              onItemClick={({ detail }) => {
                if (detail.id === 'delete') {
                  // Handle delete
                }
              }}
            >
              Actions
            </ButtonDropdown>
          }
        >
          {getDatabaseName()}
        </Header>
      }
    >
      {type === 'dsql' ? (
        <DSQLDetailsView
          cluster={database as DSQLCluster}
          activeTabId={activeTabId}
          onTabChange={setActiveTabId}
          isPopulated={isPopulated}
          populatedData={populatedData}
          onPopulate={handlePopulate}
          onClearData={handleClearData}
        />
      ) : (
        <RDSDetailsView
          cluster={database as RDSCluster}
          activeTabId={activeTabId}
          onTabChange={setActiveTabId}
          isPopulated={isPopulated}
          populatedData={populatedData}
          onPopulate={handlePopulate}
          onClearData={handleClearData}
        />
      )}
    </ContentLayout>
  );
}
