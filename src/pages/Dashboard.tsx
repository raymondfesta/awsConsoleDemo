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

export default function Dashboard() {
  const navigate = useNavigate();
  const { databases, activities } = useAppStore();

  // Calculate stats
  const activeDatabases = databases.filter(db => db.status === 'active').length;
  const totalConnections = databases.reduce((sum, db) => sum + (db.connections || 0), 0);

  // Handle getting started - navigate to create database page
  // Drawer opens automatically when user triggers an action (Auto DB setup)
  const handleGetStarted = () => {
    navigate('/create-database');
  };

  // Empty state component
  const EmptyState = () => (
    <Box textAlign="center" padding={{ vertical: 'xxxl' }}>
      <SpaceBetween size="m" alignItems="center">
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-background-status-info)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Icon name="add-plus" size="big" variant="link" />
        </div>
        <Box variant="h3" fontWeight="normal">
          No databases yet
        </Box>
        <Box variant="p" color="text-body-secondary">
          Create your first database cluster to get started with Aurora DSQL.
        </Box>
        <Button variant="primary" onClick={handleGetStarted}>
          Create database
        </Button>
      </SpaceBetween>
    </Box>
  );

  // Quick start cards for empty dashboard
  const QuickStartCards = () => (
    <Container header={<Header variant="h2">Get started</Header>}>
      <ColumnLayout columns={3} variant="text-grid">
        <div
          style={{ cursor: 'pointer' }}
          onClick={handleGetStarted}
        >
          <SpaceBetween size="xs">
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-background-status-info)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Icon name="add-plus" variant="link" />
            </div>
            <Box variant="h4">Create a database</Box>
            <Box color="text-body-secondary" fontSize="body-s">
              Set up a new Aurora DSQL cluster with AI-guided configuration.
            </Box>
            <Link>Get started</Link>
          </SpaceBetween>
        </div>
        <div
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/import-data')}
        >
          <SpaceBetween size="xs">
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-background-status-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Icon name="upload" variant="success" />
            </div>
            <Box variant="h4">Import data</Box>
            <Box color="text-body-secondary" fontSize="body-s">
              Load sample datasets or import from external sources.
            </Box>
            <Link>Learn more</Link>
          </SpaceBetween>
        </div>
        <div style={{ cursor: 'pointer' }}>
          <SpaceBetween size="xs">
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-background-status-warning)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Icon name="file" variant="warning" />
            </div>
            <Box variant="h4">Read the docs</Box>
            <Box color="text-body-secondary" fontSize="body-s">
              Learn about Aurora DSQL features and best practices.
            </Box>
            <Link external href="https://docs.aws.amazon.com">Documentation</Link>
          </SpaceBetween>
        </div>
      </ColumnLayout>
    </Container>
  );

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

  return (
    <ContentLayout
      defaultPadding
      header={
        <Header
          variant="h1"
          actions={
            <Button variant="primary" onClick={handleGetStarted}>
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
                counter={databases.length > 0 ? `(${databases.length})` : undefined}
                actions={
                  databases.length > 0 ? (
                    <Button onClick={() => navigate('/databases')}>View all</Button>
                  ) : undefined
                }
              >
                Database clusters
              </Header>
            }
          >
            {databases.length === 0 ? (
              <EmptyState />
            ) : (
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
            )}
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

        {/* Quick Start - only show when no databases */}
        {databases.length === 0 && <QuickStartCards />}

        {/* Resources section when databases exist */}
        {databases.length > 0 && (
          <Container header={<Header variant="h2">Quick actions</Header>}>
            <ColumnLayout columns={4} variant="text-grid">
              <div style={{ cursor: 'pointer' }} onClick={handleGetStarted}>
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
        )}
      </SpaceBetween>
    </ContentLayout>
  );
}
