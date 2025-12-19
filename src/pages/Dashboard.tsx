import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Box from '@cloudscape-design/components/box';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Button from '@cloudscape-design/components/button';
import Link from '@cloudscape-design/components/link';
import Cards from '@cloudscape-design/components/cards';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import Icon from '@cloudscape-design/components/icon';
import Grid from '@cloudscape-design/components/grid';
import { useAppStore, type DatabaseCluster, type ActivityEvent } from '../context/AppContext';

// Format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
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

// Get activity icon
function getActivityIcon(type: ActivityEvent['type']): 'status-positive' | 'upload' | 'status-info' | 'status-negative' {
  switch (type) {
    case 'database_created': return 'status-positive';
    case 'data_imported': return 'upload';
    case 'connection_made': return 'status-info';
    case 'query_executed': return 'status-info';
    case 'error': return 'status-negative';
    default: return 'status-info';
  }
}

// Tile-style selectable card wrapper matching Cloudscape Tiles styling
const SelectableCard = ({
  selected,
  onClick,
  children
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <div
    onClick={onClick}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
    style={{
      flex: 1,
      cursor: 'pointer',
      borderRadius: '16px',
      boxShadow: selected
        ? '0 0 0 2px #0972d3'
        : 'none',
      transition: 'box-shadow 90ms linear',
    }}
  >
    <div style={{ pointerEvents: 'none' }}>
      {children}
    </div>
  </div>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const { databases, activities } = useAppStore();
  const [selectedAction, setSelectedAction] = useState<'create' | 'explore'>('create');

  // Calculate stats
  const activeDatabases = databases.filter(db => db.status === 'active').length;
  const totalConnections = databases.reduce((sum, db) => sum + (db.connections || 0), 0);

  // Handle continue based on selection
  const handleContinue = () => {
    if (selectedAction === 'create') {
      navigate('/create-database');
    } else {
      navigate('/databases');
    }
  };

  // Activity feed component
  const ActivityFeed = () => {
    if (activities.length === 0) {
      return (
        <Box textAlign="center" padding="l" color="text-body-secondary">
          <SpaceBetween size="xs" alignItems="center">
            <Icon name="status-pending" />
            <Box>No recent activity</Box>
          </SpaceBetween>
        </Box>
      );
    }

    return (
      <SpaceBetween size="s">
        {activities.slice(0, 5).map((activity) => (
          <div
            key={activity.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '8px 0',
              borderBottom: '1px solid var(--color-border-divider-default)',
            }}
          >
            <Icon name={getActivityIcon(activity.type)} />
            <div style={{ flex: 1 }}>
              <Box fontWeight="bold" fontSize="body-s">{activity.title}</Box>
              <Box color="text-body-secondary" fontSize="body-s">{activity.description}</Box>
            </div>
            <Box color="text-body-secondary" fontSize="body-s">
              {formatRelativeTime(activity.timestamp)}
            </Box>
          </div>
        ))}
      </SpaceBetween>
    );
  };

  // Empty state - clean welcome screen with progressive disclosure
  if (databases.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '80px',
        padding: '80px 20px 40px 20px',
      }}>
        {/* Welcome text */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{
            fontSize: '42px',
            fontWeight: 300,
            color: 'var(--color-text-body-default)',
            margin: '0 0 16px 0',
            letterSpacing: '-1.26px',
            lineHeight: '48px',
          }}>
            Welcome. Innovation Awaits.
          </h1>
          <p style={{
            fontSize: '14px',
            fontWeight: 700,
            color: 'var(--color-text-body-secondary)',
            margin: 0,
            lineHeight: '18px',
          }}>
            Create, manage, and monitor your databases all in one place.
          </p>
        </div>

        {/* Selection cards */}
        <div style={{
          display: 'flex',
          gap: '20px',
          marginBottom: '48px',
          maxWidth: '800px',
          width: '100%',
        }}>
          {/* Create card */}
          <SelectableCard
            selected={selectedAction === 'create'}
            onClick={() => setSelectedAction('create')}
          >
            <Container>
              <Box textAlign="center" padding={{ vertical: 'l' }}>
                <Box variant="h2" margin={{ bottom: 'xs' }}>Create</Box>
                <Box color="text-body-secondary">
                  Create, connect, import data and start querying your database.
                </Box>
              </Box>
            </Container>
          </SelectableCard>

          {/* Explore card */}
          <SelectableCard
            selected={selectedAction === 'explore'}
            onClick={() => setSelectedAction('explore')}
          >
            <Container>
              <Box textAlign="center" padding={{ vertical: 'l' }}>
                <Box variant="h2" margin={{ bottom: 'xs' }}>Explore</Box>
                <Box color="text-body-secondary">
                  Learn about our database offerings, their features, and more.
                </Box>
              </Box>
            </Container>
          </SelectableCard>
        </div>

        {/* Continue button */}
        <Button variant="primary" onClick={handleContinue}>
          Continue
        </Button>
      </div>
    );
  }

  // Dashboard with databases
  return (
    <ContentLayout
      defaultPadding
      header={
        <Header
          variant="h1"
          actions={
            <Button variant="primary" onClick={() => navigate('/create-database')}>
              Create database
            </Button>
          }
          description="Manage your Aurora DSQL database clusters"
        >
          Dashboard
        </Header>
      }
    >
      <SpaceBetween size="l">
        {/* Stats Overview */}
        <Grid
          gridDefinition={[
            { colspan: { default: 12, s: 4 } },
            { colspan: { default: 12, s: 4 } },
            { colspan: { default: 12, s: 4 } },
          ]}
        >
          <Container>
            <SpaceBetween size="xs">
              <Box color="text-body-secondary" fontSize="body-s">Total databases</Box>
              <Box variant="h1" fontSize="display-l">{databases.length}</Box>
            </SpaceBetween>
          </Container>
          <Container>
            <SpaceBetween size="xs">
              <Box color="text-body-secondary" fontSize="body-s">Active clusters</Box>
              <Box variant="h1" fontSize="display-l">{activeDatabases}</Box>
            </SpaceBetween>
          </Container>
          <Container>
            <SpaceBetween size="xs">
              <Box color="text-body-secondary" fontSize="body-s">Active connections</Box>
              <Box variant="h1" fontSize="display-l">{totalConnections}</Box>
            </SpaceBetween>
          </Container>
        </Grid>

        {/* Main Content Grid */}
        <Grid
          gridDefinition={[
            { colspan: { default: 12, l: 8 } },
            { colspan: { default: 12, l: 4 } },
          ]}
        >
          {/* Database Clusters */}
          <Container
            header={
              <Header
                variant="h2"
                counter={`(${databases.length})`}
                actions={
                  <Button onClick={() => navigate('/databases')}>View all</Button>
                }
              >
                Database clusters
              </Header>
            }
          >
            <Cards
              items={databases.slice(0, 4)}
              cardDefinition={{
                header: (item) => (
                  <Link
                    fontSize="heading-m"
                    onFollow={(e) => {
                      e.preventDefault();
                      navigate('/database-details');
                    }}
                  >
                    {item.name}
                  </Link>
                ),
                sections: [
                  {
                    id: 'status',
                    header: 'Status',
                    content: (item) => (
                      <StatusIndicator type={getStatusType(item.status)}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </StatusIndicator>
                    ),
                  },
                  {
                    id: 'engine',
                    header: 'Engine',
                    content: (item) => item.engine,
                  },
                  {
                    id: 'region',
                    header: 'Region',
                    content: (item) => item.region,
                  },
                ],
              }}
              cardsPerRow={[{ cards: 1 }, { minWidth: 500, cards: 2 }]}
              trackBy="id"
            />
          </Container>

          {/* Activity Feed */}
          <Container
            header={
              <Header
                variant="h2"
                actions={
                  activities.length > 0 ? (
                    <Button variant="icon" iconName="refresh" ariaLabel="Refresh activity" />
                  ) : undefined
                }
              >
                Recent activity
              </Header>
            }
          >
            <ActivityFeed />
          </Container>
        </Grid>

        {/* Quick actions */}
        <Container header={<Header variant="h2">Quick actions</Header>}>
          <ColumnLayout columns={4} variant="text-grid">
            <div style={{ cursor: 'pointer' }} onClick={() => navigate('/create-database')}>
              <SpaceBetween size="xxs">
                <Icon name="add-plus" />
                <Link>Create database</Link>
              </SpaceBetween>
            </div>
            <div style={{ cursor: 'pointer' }} onClick={() => navigate('/import-data')}>
              <SpaceBetween size="xxs">
                <Icon name="upload" />
                <Link>Import data</Link>
              </SpaceBetween>
            </div>
            <div>
              <SpaceBetween size="xxs">
                <Icon name="settings" />
                <Link onFollow={() => navigate('/settings')}>Settings</Link>
              </SpaceBetween>
            </div>
            <div>
              <SpaceBetween size="xxs">
                <Icon name="external" />
                <Link external href="https://docs.aws.amazon.com">Documentation</Link>
              </SpaceBetween>
            </div>
          </ColumnLayout>
        </Container>
      </SpaceBetween>
    </ContentLayout>
  );
}
