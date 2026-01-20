import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import Icon from '@cloudscape-design/components/icon';
import Grid from '@cloudscape-design/components/grid';
import LineChart from '@cloudscape-design/components/line-chart';
import AreaChart from '@cloudscape-design/components/area-chart';
import PieChart from '@cloudscape-design/components/pie-chart';
import Badge from '@cloudscape-design/components/badge';
import { useAppStore, type DatabaseCluster, type ActivityEvent } from '../context/AppContext';
import { ALERT_SUMMARY } from '../data/alertsMockData';
import { MOCK_RECOMMENDATIONS } from '../data/recommendationsMockData';
import { MOCK_INVESTIGATIONS } from '../data/investigationsMockData';

// Generate mock time series data for charts
function generateTimeSeriesData(hours: number, baseValue: number, variance: number) {
  const now = new Date();
  const data = [];
  for (let i = hours; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    const value = Math.max(0, baseValue + Math.floor(Math.random() * variance * 2 - variance));
    data.push({ x: time, y: value });
  }
  return data;
}

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

// Calculate engine distribution from databases
function calculateEngineDistribution(databases: DatabaseCluster[]) {
  const engineColors: Record<string, string> = {
    'Amazon Aurora PostgreSQL': '#ff9900',
    'Amazon DynamoDB': '#3366cc',
    'Amazon RDS for MySQL': '#dd3333',
    'Amazon ElastiCache for Redis': '#22aa22',
    'Amazon DocumentDB': '#9933cc',
    'Amazon Neptune': '#00cccc',
    'Amazon Timestream': '#cc6600',
    'Amazon MemoryDB for Redis': '#6699cc',
  };

  const counts = databases.reduce((acc, db) => {
    acc[db.engine] = (acc[db.engine] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(counts).map(([engine, count]) => ({
    title: engine.replace('Amazon ', ''),
    value: count,
    color: engineColors[engine] || '#888888',
  }));
}

// Calculate regional distribution
function calculateRegionalDistribution(databases: DatabaseCluster[]) {
  const regionColors: Record<string, string> = {
    'us-east-1': '#0972d3',
    'us-east-2': '#9933cc',
    'us-west-1': '#cc6600',
    'us-west-2': '#ff9900',
    'eu-west-1': '#22aa22',
    'eu-central-1': '#00cccc',
    'ap-southeast-1': '#dd3333',
  };

  const counts = databases.reduce((acc, db) => {
    acc[db.region] = (acc[db.region] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(counts).map(([region, count]) => ({
    title: region,
    value: count,
    color: regionColors[region] || '#888888',
  }));
}

// Tile-style selectable card matching Cloudscape Tiles selected state
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
      border: selected
        ? '2px solid #0972d3'
        : '1px solid #414d5c',
      background: selected
        ? 'rgba(9, 114, 211, 0.1)'
        : 'var(--color-background-layout-main)',
      padding: '20px',
      transition: 'border-color 90ms linear, background-color 90ms linear',
    }}
  >
    <div style={{ pointerEvents: 'none' }}>
      {children}
    </div>
  </div>
);

// Alert Summary Banner - links to Alerts page
function AlertSummaryBanner({ onClick }: { onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
      style={{
        background: 'linear-gradient(90deg, #d91515 0%, #ff9900 100%)',
        borderRadius: '8px',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
      }}
    >
      <SpaceBetween direction="horizontal" size="l" alignItems="center">
        <Icon name="status-warning" variant="inverted" size="big" />
        <SpaceBetween size="xxxs">
          <Box fontSize="body-s" fontWeight="bold">
            <span style={{ color: 'white' }}>Active Alerts</span>
          </Box>
          <SpaceBetween direction="horizontal" size="m">
            <Badge color="red">{ALERT_SUMMARY.critical} Critical</Badge>
            <Badge color="grey">{ALERT_SUMMARY.warning} Warning</Badge>
            <Badge color="blue">{ALERT_SUMMARY.predictive} Predictive</Badge>
          </SpaceBetween>
        </SpaceBetween>
      </SpaceBetween>
      <SpaceBetween direction="horizontal" size="xs" alignItems="center">
        <span style={{ color: 'white' }}>View All</span>
        <Icon name="angle-right" variant="inverted" />
      </SpaceBetween>
    </div>
  );
}

// Compact recommendation card for dashboard preview
function RecommendationPreview({ recommendation }: { recommendation: typeof MOCK_RECOMMENDATIONS[0] }) {
  return (
    <div style={{
      padding: '12px',
      borderBottom: '1px solid var(--color-border-divider-default)',
    }}>
      <SpaceBetween size="xxs">
        <SpaceBetween direction="horizontal" size="xs" alignItems="center">
          <Badge color={recommendation.severity === 'high' ? 'red' : 'blue'}>
            {recommendation.severity}
          </Badge>
          <Badge color="green">{recommendation.confidence}%</Badge>
        </SpaceBetween>
        <Box fontWeight="bold" fontSize="body-s">{recommendation.title}</Box>
        <Box color="text-body-secondary" fontSize="body-s">
          {recommendation.timeframe} - {recommendation.database}
        </Box>
      </SpaceBetween>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { databases, activities } = useAppStore();
  const [selectedAction, setSelectedAction] = useState<'create' | 'explore'>('create');


  // Calculate stats
  const activeDatabases = databases.filter(db => db.status === 'active').length;
  const totalConnections = databases.reduce((sum, db) => sum + (db.connections || 0), 0);
  const totalStorage = databases.reduce((sum, db) => {
    const storageNum = parseInt(db.storage?.replace(/[^0-9]/g, '') || '0');
    return sum + storageNum;
  }, 0);
  const estimatedMonthlyCost = databases.length * 450; // Mock ~$450/db average

  // Calculate distribution data (memoized)
  const engineDistribution = useMemo(() => calculateEngineDistribution(databases), [databases]);
  const regionalDistribution = useMemo(() => calculateRegionalDistribution(databases), [databases]);

  // Generate chart data (memoized to prevent regeneration on every render)
  const chartData = useMemo(() => ({
    connections: generateTimeSeriesData(24, totalConnections > 0 ? totalConnections * 10 : 50, 20),
    readOps: generateTimeSeriesData(24, 1200, 400),
    writeOps: generateTimeSeriesData(24, 450, 150),
  }), [totalConnections]);

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
            <Box textAlign="center" padding={{ vertical: 'l' }}>
              <Box variant="h2" margin={{ bottom: 'xs' }}>Create</Box>
              <Box color="text-body-secondary">
                Create, connect, import data and start querying your database.
              </Box>
            </Box>
          </SelectableCard>

          {/* Explore card */}
          <SelectableCard
            selected={selectedAction === 'explore'}
            onClick={() => setSelectedAction('explore')}
          >
            <Box textAlign="center" padding={{ vertical: 'l' }}>
              <Box variant="h2" margin={{ bottom: 'xs' }}>Explore</Box>
              <Box color="text-body-secondary">
                Learn about our database offerings, their features, and more.
              </Box>
            </Box>
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
            <Button variant="primary" onClick={() => navigate('/create-database')} iconAlign="left" iconName="gen-ai">
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
        {/* Stats Overview - Row 1 */}
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
              <Box color="text-body-secondary" fontSize="body-s">Total connections</Box>
              <Box variant="h1" fontSize="display-l">{totalConnections}</Box>
            </SpaceBetween>
          </Container>
        </Grid>

        {/* Stats Overview - Row 2 */}
        <Grid
          gridDefinition={[
            { colspan: { default: 12, s: 4 } },
            { colspan: { default: 12, s: 4 } },
            { colspan: { default: 12, s: 4 } },
          ]}
        >
          <Container>
            <SpaceBetween size="xs">
              <Box color="text-body-secondary" fontSize="body-s">Total storage</Box>
              <Box variant="h1" fontSize="display-l">{totalStorage} GB</Box>
            </SpaceBetween>
          </Container>
          <Container>
            <SpaceBetween size="xs">
              <Box color="text-body-secondary" fontSize="body-s">Est. monthly cost</Box>
              <Box variant="h1" fontSize="display-l">${estimatedMonthlyCost.toLocaleString()}</Box>
            </SpaceBetween>
          </Container>
          <Container>
            <SpaceBetween size="xs">
              <Box color="text-body-secondary" fontSize="body-s">Active alerts</Box>
              <Box variant="h1" fontSize="display-l" color="text-status-error">
                {ALERT_SUMMARY.critical + ALERT_SUMMARY.warning}
              </Box>
            </SpaceBetween>
          </Container>
        </Grid>

        {/* Charts Grid */}
        <Grid
          gridDefinition={[
            { colspan: { default: 12, l: 6 } },
            { colspan: { default: 12, l: 6 } },
          ]}
        >
          {/* Connections Chart */}
          <Container
            fitHeight
            header={<Header variant="h2">Connections over time</Header>}
          >
            <LineChart
              series={[
                {
                  title: 'Active connections',
                  type: 'line',
                  data: chartData.connections,
                },
              ]}
              xDomain={[
                chartData.connections[0]?.x || new Date(),
                chartData.connections[chartData.connections.length - 1]?.x || new Date(),
              ]}
              yDomain={[0, Math.max(...chartData.connections.map(d => d.y)) + 20]}
              xScaleType="time"
              xTitle="Time"
              yTitle="Connections"
              height={200}
              hideFilter
              hideLegend
              ariaLabel="Connections over time line chart"
              i18nStrings={{
                xTickFormatter: (value) => {
                  const date = new Date(value);
                  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                },
              }}
              empty={
                <Box textAlign="center" color="inherit">
                  <b>No data available</b>
                </Box>
              }
            />
          </Container>

          {/* Database Operations Chart */}
          <Container
            fitHeight
            header={<Header variant="h2">Database operations</Header>}
          >
            <AreaChart
              series={[
                {
                  title: 'Read operations',
                  type: 'area',
                  data: chartData.readOps,
                },
                {
                  title: 'Write operations',
                  type: 'area',
                  data: chartData.writeOps,
                },
              ]}
              xDomain={[
                chartData.readOps[0]?.x || new Date(),
                chartData.readOps[chartData.readOps.length - 1]?.x || new Date(),
              ]}
              yDomain={[0, Math.max(...chartData.readOps.map(d => d.y), ...chartData.writeOps.map(d => d.y)) + 200]}
              xScaleType="time"
              xTitle="Time"
              yTitle="Operations/hour"
              height={200}
              hideFilter
              ariaLabel="Database operations area chart"
              i18nStrings={{
                xTickFormatter: (value) => {
                  const date = new Date(value);
                  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                },
              }}
              empty={
                <Box textAlign="center" color="inherit">
                  <b>No data available</b>
                </Box>
              }
            />
          </Container>
        </Grid>

        {/* Distribution Charts */}
        <Grid
          gridDefinition={[
            { colspan: { default: 12, m: 6 } },
            { colspan: { default: 12, m: 6 } },
          ]}
        >
          {/* Engine Distribution */}
          <Container fitHeight header={<Header variant="h2">Database engines</Header>}>
            <PieChart
              data={engineDistribution}
              detailPopoverContent={(datum) => [
                { key: 'Count', value: datum.value },
              ]}
              segmentDescription={(datum, sum) =>
                `${datum.value} databases (${((datum.value / sum) * 100).toFixed(0)}%)`
              }
              hideFilter
              size="medium"
              variant="donut"
              innerMetricDescription="total"
              innerMetricValue={String(databases.length)}
              ariaLabel="Database engine distribution pie chart"
            />
          </Container>

          {/* Regional Distribution */}
          <Container fitHeight header={<Header variant="h2">Regional distribution</Header>}>
            <PieChart
              data={regionalDistribution}
              detailPopoverContent={(datum) => [
                { key: 'Databases', value: datum.value },
              ]}
              segmentDescription={(datum, sum) =>
                `${datum.value} databases (${((datum.value / sum) * 100).toFixed(0)}%)`
              }
              hideFilter
              size="medium"
              variant="donut"
              innerMetricDescription="regions"
              innerMetricValue={String(regionalDistribution.length)}
              ariaLabel="Regional distribution pie chart"
            />
          </Container>
        </Grid>

        {/* Alert Summary Banner */}
        <AlertSummaryBanner onClick={() => navigate('/alerts')} />

        {/* Main Content Grid */}
        <Grid
          gridDefinition={[
            { colspan: { default: 12, l: 6 } },
            { colspan: { default: 12, l: 6 } },
          ]}
        >
          {/* AI Investigations */}
          <Container
            fitHeight
            header={
              <Header
                variant="h2"
                actions={<Button onClick={() => navigate('/investigations')}>View all</Button>}
              >
                AI Investigations
              </Header>
            }
          >
            <SpaceBetween size="m">
              <Grid
                gridDefinition={[
                  { colspan: 6 },
                  { colspan: 6 },
                ]}
              >
                <SpaceBetween size="xs">
                  <Box color="text-body-secondary" fontSize="body-s">Completed</Box>
                  <Box variant="h1" fontSize="display-l">
                    {MOCK_INVESTIGATIONS.filter(i => i.status === 'completed').length}
                  </Box>
                </SpaceBetween>
                <SpaceBetween size="xs">
                  <Box color="text-body-secondary" fontSize="body-s">In progress</Box>
                  <Box variant="h1" fontSize="display-l">
                    {MOCK_INVESTIGATIONS.filter(i => i.status === 'in_progress').length}
                  </Box>
                </SpaceBetween>
              </Grid>
              <Button variant="primary" iconName="gen-ai" onClick={() => navigate('/investigations')}>
                Start investigation
              </Button>
            </SpaceBetween>
          </Container>

          {/* Activity Feed */}
          <Container
            fitHeight
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

        {/* Recommendations Section */}
        <Container
          header={
            <Header
              variant="h2"
              actions={<Button onClick={() => navigate('/recommendations')}>View all</Button>}
            >
              Predictive recommendations
            </Header>
          }
        >
          <SpaceBetween size="xs">
            {MOCK_RECOMMENDATIONS.slice(0, 4).map((rec) => (
              <RecommendationPreview key={rec.id} recommendation={rec} />
            ))}
          </SpaceBetween>
        </Container>
      </SpaceBetween>
    </ContentLayout>
  );
}
