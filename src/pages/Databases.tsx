import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Cards from '@cloudscape-design/components/cards';
import Header from '@cloudscape-design/components/header';
import Button from '@cloudscape-design/components/button';
import Box from '@cloudscape-design/components/box';
import Link from '@cloudscape-design/components/link';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import TextFilter from '@cloudscape-design/components/text-filter';
import Pagination from '@cloudscape-design/components/pagination';
import Spinner from '@cloudscape-design/components/spinner';
import Alert from '@cloudscape-design/components/alert';
import { useAppStore, type DatabaseCluster } from '../context/AppContext';
import { dsqlApi, rdsApi, type DSQLCluster, type RDSCluster } from '../services/api';

// Extended type to include database type for routing
interface DatabaseClusterWithType extends DatabaseCluster {
  dbType: 'dsql' | 'rds';
}

// Format date
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
function getStatusType(status: DatabaseCluster['status']): 'success' | 'warning' | 'error' | 'loading' {
  switch (status) {
    case 'active': return 'success';
    case 'creating': return 'loading';
    case 'stopped': return 'warning';
    case 'error': return 'error';
    default: return 'loading';
  }
}

// Map DSQL cluster to DatabaseClusterWithType
function mapDsqlCluster(cluster: DSQLCluster): DatabaseClusterWithType {
  // Extract region from ARN (format: arn:aws:dsql:region:account:cluster/id)
  const arnParts = cluster.arn.split(':');
  const region = arnParts[3] || 'us-east-1';

  return {
    id: cluster.id,
    name: cluster.id,
    engine: 'Aurora DSQL',
    region,
    status: cluster.status.toLowerCase() === 'active' ? 'active' :
            cluster.status.toLowerCase() === 'creating' ? 'creating' :
            cluster.status.toLowerCase() === 'deleting' ? 'stopped' : 'active',
    endpoint: cluster.endpoint,
    createdAt: new Date(cluster.createdAt),
    dbType: 'dsql',
  };
}

// Map RDS cluster to DatabaseClusterWithType
function mapRdsCluster(cluster: RDSCluster): DatabaseClusterWithType {
  return {
    id: cluster.id,
    name: cluster.name,
    engine: cluster.engine,
    region: cluster.region,
    status: cluster.status.toLowerCase() === 'available' ? 'active' :
            cluster.status.toLowerCase() === 'creating' ? 'creating' :
            cluster.status.toLowerCase() === 'stopped' ? 'stopped' : 'active',
    endpoint: cluster.endpoint,
    createdAt: new Date(cluster.createdAt),
    dbType: 'rds',
  };
}

// Card definition for displaying database clusters
const cardDefinition = {
  header: (item: DatabaseClusterWithType) => (
    <Link fontSize="heading-m" href={`/database-details?id=${item.id}&type=${item.dbType}`}>
      {item.name}
    </Link>
  ),
  sections: [
    {
      id: 'status',
      header: 'Status',
      content: (item: DatabaseClusterWithType) => (
        <StatusIndicator type={getStatusType(item.status)}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </StatusIndicator>
      ),
    },
    {
      id: 'engine',
      header: 'Engine',
      content: (item: DatabaseClusterWithType) => item.engine,
    },
    {
      id: 'region',
      header: 'Region',
      content: (item: DatabaseClusterWithType) => item.region,
    },
    {
      id: 'endpoint',
      header: 'Endpoint',
      content: (item: DatabaseClusterWithType) => item.endpoint || '-',
    },
    {
      id: 'createdAt',
      header: 'Created',
      content: (item: DatabaseClusterWithType) => formatDate(item.createdAt),
    },
  ],
};

export default function Databases() {
  const navigate = useNavigate();

  // Get databases from local store (includes newly created databases)
  const storeDatabases = useAppStore((state) => state.databases);

  const [apiDatabases, setApiDatabases] = useState<DatabaseClusterWithType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteringText, setFilteringText] = useState('');
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const pageSize = 12;

  // Fetch databases from both DSQL and RDS APIs
  useEffect(() => {
    const fetchDatabases = async () => {
      setLoading(true);
      setError(null);
      try {
        const [dsqlClusters, rdsClusters] = await Promise.all([
          dsqlApi.getClusters(),
          rdsApi.getClusters(),
        ]);

        const mappedDsql = dsqlClusters.map(mapDsqlCluster);
        const mappedRds = rdsClusters.map(mapRdsCluster);

        setApiDatabases([...mappedDsql, ...mappedRds]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load databases');
      } finally {
        setLoading(false);
      }
    };

    fetchDatabases();
  }, []);

  // Merge store databases with API databases (store takes priority for duplicates)
  const databases: DatabaseClusterWithType[] = [
    // Add store databases with dbType (default to dsql for locally created)
    ...storeDatabases.map((db): DatabaseClusterWithType => ({
      ...db,
      dbType: 'dsql',
    })),
    // Add API databases that aren't already in the store
    ...apiDatabases.filter((apiDb) => !storeDatabases.some((storeDb) => storeDb.id === apiDb.id)),
  ];

  // Filter items
  const filteredItems = databases.filter((item) =>
    item.name.toLowerCase().includes(filteringText.toLowerCase()) ||
    item.engine.toLowerCase().includes(filteringText.toLowerCase()) ||
    item.region.toLowerCase().includes(filteringText.toLowerCase())
  );

  // Paginate items
  const paginatedItems = filteredItems.slice(
    (currentPageIndex - 1) * pageSize,
    currentPageIndex * pageSize
  );

  // Handle create database - navigate to workflow page
  const handleCreateDatabase = () => {
    navigate('/create-database');
  };

  // Empty state - standard Cloudscape pattern
  const EmptyState = () => (
    <Box textAlign="center" color="inherit">
      <b>No database clusters</b>
      <Box padding={{ bottom: 's' }} variant="p" color="inherit">
        No database clusters to display.
      </Box>
      <Button onClick={handleCreateDatabase} iconAlign="left" iconName="gen-ai">Create database</Button>
    </Box>
  );

  // No match state - standard Cloudscape pattern
  const NoMatchState = () => (
    <Box textAlign="center" color="inherit">
      <b>No matches</b>
      <Box padding={{ bottom: 's' }} variant="p" color="inherit">
        We can't find a match.
      </Box>
      <Button onClick={() => setFilteringText('')}>Clear filter</Button>
    </Box>
  );

  if (loading) {
    return (
      <ContentLayout
        defaultPadding
        header={
          <Header variant="h1" description="View and manage all your AWS database resources.">
            Database clusters
          </Header>
        }
      >
        <Box textAlign="center" padding="xxl">
          <Spinner size="large" />
          <Box variant="p" padding={{ top: 's' }}>Loading databases...</Box>
        </Box>
      </ContentLayout>
    );
  }

  if (error) {
    return (
      <ContentLayout
        defaultPadding
        header={
          <Header
            variant="h1"
            description="View and manage all your AWS database resources."
            actions={
              <Button variant="primary" onClick={handleCreateDatabase} iconAlign="left" iconName="gen-ai">
                Create database
              </Button>
            }
          >
            Database clusters
          </Header>
        }
      >
        <Alert type="error" header="Error loading databases">
          {error}
        </Alert>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout
      defaultPadding
      header={
        <Header
          variant="h1"
          description="View and manage all your AWS database resources."
          actions={
            <Button variant="primary" onClick={handleCreateDatabase} iconAlign="left" iconName="gen-ai">
              Create database
            </Button>
          }
          counter={databases.length > 0 ? `(${databases.length})` : undefined}
        >
          Database clusters
        </Header>
      }
    >
      <Cards
        cardDefinition={cardDefinition}
        items={paginatedItems}
        trackBy="id"
        cardsPerRow={[
          { cards: 1 },
          { minWidth: 500, cards: 2 },
          { minWidth: 992, cards: 3 },
        ]}
        empty={filteringText ? <NoMatchState /> : <EmptyState />}
        filter={
          <TextFilter
            filteringPlaceholder="Search databases"
            filteringText={filteringText}
            onChange={({ detail }) => setFilteringText(detail.filteringText)}
          />
        }
        header={
          <Header counter={`(${filteredItems.length})`}>
            Clusters
          </Header>
        }
        pagination={
          <Pagination
            currentPageIndex={currentPageIndex}
            pagesCount={Math.ceil(filteredItems.length / pageSize)}
            onChange={({ detail }) => setCurrentPageIndex(detail.currentPageIndex)}
          />
        }
      />
    </ContentLayout>
  );
}
