import { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Header from '@cloudscape-design/components/header';
import Container from '@cloudscape-design/components/container';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Grid from '@cloudscape-design/components/grid';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import Table from '@cloudscape-design/components/table';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import BarChart from '@cloudscape-design/components/bar-chart';
import PieChart from '@cloudscape-design/components/pie-chart';
import Icon from '@cloudscape-design/components/icon';
import TextFilter from '@cloudscape-design/components/text-filter';
import Pagination from '@cloudscape-design/components/pagination';
import Multiselect from '@cloudscape-design/components/multiselect';
import ButtonDropdown from '@cloudscape-design/components/button-dropdown';
import { useAppStore } from '../context/AppContext';
import { AlertDetailDrawer } from '../components/alerts';
import {
  ALERT_SUMMARY,
  ALERT_VOLUME_DATA,
  ALERT_SOURCES,
  formatTimeAgo,
  type Alert,
} from '../data/alertsMockData';

// Summary card component
function SummaryCard({
  title,
  value,
  color,
  onClick,
}: {
  title: string;
  value: number;
  color: 'red' | 'orange' | 'blue' | 'grey';
  onClick?: () => void;
}) {
  const colorMap = {
    red: '#d91515',
    orange: '#ff9900',
    blue: '#0972d3',
    grey: '#5f6b7a',
  };

  return (
    <Container
      fitHeight
      header={
        <Box textAlign="center" padding={{ top: 's' }}>
          <Box fontSize="display-l" fontWeight="bold" color="text-status-error" variant="span">
            <span style={{ color: colorMap[color], fontSize: '2.5rem' }}>{value}</span>
          </Box>
          <Box color="text-body-secondary" fontSize="body-s" padding={{ top: 'xxs' }}>
            {title}
          </Box>
        </Box>
      }
    >
      {onClick && (
        <Box textAlign="center">
          <Button variant="link" onClick={onClick}>
            View all
          </Button>
        </Box>
      )}
    </Container>
  );
}

// Recommendations Banner
function RecommendationsBanner({ onClick }: { onClick: () => void }) {
  return (
    <div
      style={{
        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '8px',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
      }}
      onClick={onClick}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '1.5rem' }}>
          <Icon name="suggestions" variant="inverted" />
        </span>
        <span style={{ color: 'white', fontWeight: 500 }}>Recommendations</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
        <span>View All</span>
        <Icon name="angle-right" variant="inverted" />
      </div>
    </div>
  );
}

export default function AlertsDashboard() {
  const navigate = useNavigate();
  const tableRef = useRef<HTMLDivElement>(null);
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<Alert[]>([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const pageSize = 10;

  // Get state and actions from store
  const {
    alerts,
    selectedAlertId,
    alertFilters,
    setSelectedAlertId,
    acknowledgeAlert,
    resolveAlert,
    bulkAcknowledgeAlerts,
    bulkResolveAlerts,
    setAlertFilters,
    clearAlertFilters,
    addNotification,
  } = useAppStore();

  // Get unique databases for filter options
  const uniqueDatabases = useMemo(() => {
    return [...new Set(alerts.map((a) => a.database))];
  }, [alerts]);

  // Filter alerts based on search text and filters
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      // Text filter
      const matchesText =
        alert.name.toLowerCase().includes(filterText.toLowerCase()) ||
        alert.database.toLowerCase().includes(filterText.toLowerCase());

      // Severity filter
      const matchesSeverity =
        alertFilters.severity.length === 0 || alertFilters.severity.includes(alert.severity);

      // Status filter
      const matchesStatus =
        alertFilters.status.length === 0 || alertFilters.status.includes(alert.status);

      // Database filter
      const matchesDatabase =
        alertFilters.database.length === 0 || alertFilters.database.includes(alert.database);

      return matchesText && matchesSeverity && matchesStatus && matchesDatabase;
    });
  }, [alerts, filterText, alertFilters]);

  // Get selected alert for drawer
  const selectedAlert = alerts.find((a) => a.id === selectedAlertId) || null;

  // Check if any filters are active
  const hasActiveFilters =
    alertFilters.severity.length > 0 ||
    alertFilters.status.length > 0 ||
    alertFilters.database.length > 0;

  // Get severity indicator type
  const getSeverityType = (severity: Alert['severity']): 'error' | 'warning' | 'info' => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  };

  // Get status indicator type
  const getStatusType = (status: Alert['status']): 'error' | 'warning' | 'success' => {
    switch (status) {
      case 'active':
        return 'error';
      case 'acknowledged':
        return 'warning';
      case 'resolved':
        return 'success';
    }
  };

  // Handle alert row click
  const handleAlertClick = (alert: Alert) => {
    setSelectedAlertId(alert.id);
    setDrawerVisible(true);
  };

  // Handle acknowledge with notification
  const handleAcknowledge = (id: string) => {
    const alert = alerts.find((a) => a.id === id);
    acknowledgeAlert(id);
    addNotification({
      type: 'success',
      content: `Alert "${alert?.name}" has been acknowledged`,
      dismissible: true,
    });
  };

  // Handle resolve with notification
  const handleResolve = (id: string) => {
    const alert = alerts.find((a) => a.id === id);
    resolveAlert(id);
    addNotification({
      type: 'success',
      content: `Alert "${alert?.name}" has been resolved`,
      dismissible: true,
    });
    setDrawerVisible(false);
  };

  // Handle bulk actions
  const handleBulkAction = (action: 'acknowledge' | 'resolve') => {
    const ids = selectedItems.map((item) => item.id);
    if (action === 'acknowledge') {
      bulkAcknowledgeAlerts(ids);
      addNotification({
        type: 'success',
        content: `${ids.length} alert(s) have been acknowledged`,
        dismissible: true,
      });
    } else {
      bulkResolveAlerts(ids);
      addNotification({
        type: 'success',
        content: `${ids.length} alert(s) have been resolved`,
        dismissible: true,
      });
    }
    setSelectedItems([]);
  };

  // Handle summary card click to filter
  const handleSeverityFilter = (severity: string) => {
    const normalizedSeverity = severity.toLowerCase();
    setAlertFilters({ severity: [normalizedSeverity] });
    tableRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Prepare bar chart data
  const barChartData = [
    {
      title: 'Critical',
      type: 'bar' as const,
      data: ALERT_VOLUME_DATA.map((d) => ({ x: d.day, y: d.critical })),
      color: '#d91515',
    },
    {
      title: 'Warning',
      type: 'bar' as const,
      data: ALERT_VOLUME_DATA.map((d) => ({ x: d.day, y: d.warning })),
      color: '#ff9900',
    },
    {
      title: 'Info',
      type: 'bar' as const,
      data: ALERT_VOLUME_DATA.map((d) => ({ x: d.day, y: d.info })),
      color: '#0972d3',
    },
  ];

  // Prepare pie chart data
  const pieChartData = ALERT_SOURCES.map((source) => ({
    title: source.source,
    value: source.count,
    color: source.color,
  }));

  return (
    <ContentLayout
      defaultPadding
      header={
        <Header
          variant="h1"
          description="Monitor and manage your database alerts and incidents"
          actions={<Button iconName="settings">Configure Alerts</Button>}
        >
          Database Monitoring Alerts
        </Header>
      }
    >
      <SpaceBetween size="l">
        {/* Summary Cards */}
        <Grid
          gridDefinition={[
            { colspan: { default: 12, s: 3 } },
            { colspan: { default: 12, s: 3 } },
            { colspan: { default: 12, s: 3 } },
            { colspan: { default: 12, s: 3 } },
          ]}
        >
          <SummaryCard
            title="Critical"
            value={ALERT_SUMMARY.critical}
            color="red"
            onClick={() => handleSeverityFilter('critical')}
          />
          <SummaryCard
            title="Warning"
            value={ALERT_SUMMARY.warning}
            color="orange"
            onClick={() => handleSeverityFilter('warning')}
          />
          <SummaryCard
            title="Predictive & Spikes"
            value={ALERT_SUMMARY.predictive}
            color="blue"
            onClick={() => handleSeverityFilter('info')}
          />
          <SummaryCard title="All Alerts" value={ALERT_SUMMARY.total} color="grey" />
        </Grid>

        {/* Charts Row */}
        <Grid
          gridDefinition={[
            { colspan: { default: 12, s: 7 } },
            { colspan: { default: 12, s: 5 } },
          ]}
        >
          {/* 7-Day Alert Volume */}
          <Container header={<Header variant="h2">7-Day Alert Volume</Header>}>
            <BarChart
              series={barChartData}
              xDomain={ALERT_VOLUME_DATA.map((d) => d.day)}
              yDomain={[0, 40]}
              xTitle="Day"
              yTitle="Alerts"
              stackedBars
              height={250}
              hideFilter
              hideLegend={false}
            />
          </Container>

          {/* Alerts by Source */}
          <Container
            header={
              <Header variant="h2" actions={<Button variant="inline-link">By Source</Button>}>
                Alerts by Source
              </Header>
            }
          >
            <PieChart
              data={pieChartData}
              detailPopoverContent={(datum) => [
                { key: 'Count', value: datum.value },
                { key: 'Percentage', value: `${Math.round((datum.value / 47) * 100)}%` },
              ]}
              segmentDescription={(datum, sum) =>
                `${datum.value} alerts, ${((datum.value / sum) * 100).toFixed(0)}%`
              }
              hideFilter
              hideLegend={false}
              size="medium"
              variant="donut"
              innerMetricDescription="total"
              innerMetricValue="47"
            />
          </Container>
        </Grid>

        {/* Recommendations Banner */}
        <RecommendationsBanner onClick={() => navigate('/recommendations')} />

        {/* Filters */}
        <Container>
          <SpaceBetween size="s">
            <Header variant="h3">Filters</Header>
            <SpaceBetween direction="horizontal" size="s">
              <Multiselect
                selectedOptions={alertFilters.severity.map((s) => ({
                  label: s.charAt(0).toUpperCase() + s.slice(1),
                  value: s,
                }))}
                options={[
                  { label: 'Critical', value: 'critical' },
                  { label: 'Warning', value: 'warning' },
                  { label: 'Info', value: 'info' },
                ]}
                placeholder="Filter by severity"
                onChange={({ detail }) =>
                  setAlertFilters({
                    severity: detail.selectedOptions.map((o) => o.value!),
                  })
                }
              />
              <Multiselect
                selectedOptions={alertFilters.status.map((s) => ({
                  label: s.charAt(0).toUpperCase() + s.slice(1),
                  value: s,
                }))}
                options={[
                  { label: 'Active', value: 'active' },
                  { label: 'Acknowledged', value: 'acknowledged' },
                  { label: 'Resolved', value: 'resolved' },
                ]}
                placeholder="Filter by status"
                onChange={({ detail }) =>
                  setAlertFilters({
                    status: detail.selectedOptions.map((o) => o.value!),
                  })
                }
              />
              <Multiselect
                selectedOptions={alertFilters.database.map((d) => ({
                  label: d,
                  value: d,
                }))}
                options={uniqueDatabases.map((db) => ({ label: db, value: db }))}
                placeholder="Filter by database"
                onChange={({ detail }) =>
                  setAlertFilters({
                    database: detail.selectedOptions.map((o) => o.value!),
                  })
                }
              />
              {hasActiveFilters && (
                <Button variant="link" onClick={clearAlertFilters}>
                  Clear filters
                </Button>
              )}
            </SpaceBetween>
          </SpaceBetween>
        </Container>

        {/* Active Alerts Table */}
        <div ref={tableRef}>
          <Container
            header={
              <Header
                variant="h2"
                counter={`(${filteredAlerts.length})`}
                actions={
                  <SpaceBetween direction="horizontal" size="xs">
                    <TextFilter
                      filteringText={filterText}
                      filteringPlaceholder="Search"
                      filteringAriaLabel="Filter alerts"
                      onChange={({ detail }) => setFilterText(detail.filteringText)}
                    />
                    {selectedItems.length > 0 && (
                      <ButtonDropdown
                        items={[
                          { id: 'acknowledge', text: 'Acknowledge Selected' },
                          { id: 'resolve', text: 'Resolve Selected' },
                        ]}
                        onItemClick={({ detail }) =>
                          handleBulkAction(detail.id as 'acknowledge' | 'resolve')
                        }
                      >
                        Actions ({selectedItems.length})
                      </ButtonDropdown>
                    )}
                    <Button iconName="ellipsis" variant="icon" ariaLabel="More actions" />
                  </SpaceBetween>
                }
              >
                Active Alerts
              </Header>
            }
          >
            <Table
              items={filteredAlerts.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
              selectionType="multi"
              selectedItems={selectedItems}
              onSelectionChange={({ detail }) => setSelectedItems(detail.selectedItems)}
              onRowClick={({ detail }) => handleAlertClick(detail.item)}
              columnDefinitions={[
                {
                  id: 'severity',
                  header: 'Alert',
                  cell: (item) => (
                    <StatusIndicator type={getSeverityType(item.severity)}>
                      {item.name}
                    </StatusIndicator>
                  ),
                  width: 250,
                },
                {
                  id: 'description',
                  header: 'Details',
                  cell: (item) => (
                    <Box color="text-body-secondary">
                      {item.description} &bull; {item.database} &bull;{' '}
                      {formatTimeAgo(item.triggeredAt)}
                    </Box>
                  ),
                },
                {
                  id: 'status',
                  header: 'Status',
                  cell: (item) => (
                    <StatusIndicator type={getStatusType(item.status)}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </StatusIndicator>
                  ),
                  width: 140,
                },
                {
                  id: 'action',
                  header: '',
                  cell: () => <Icon name="angle-right" />,
                  width: 50,
                },
              ]}
              variant="embedded"
              stripedRows
              wrapLines
              empty={
                <Box textAlign="center" color="text-body-secondary" padding="l">
                  No active alerts
                </Box>
              }
              pagination={
                filteredAlerts.length > pageSize ? (
                  <Pagination
                    currentPageIndex={currentPage}
                    pagesCount={Math.ceil(filteredAlerts.length / pageSize)}
                    onChange={({ detail }) => setCurrentPage(detail.currentPageIndex)}
                  />
                ) : undefined
              }
            />
          </Container>
        </div>
      </SpaceBetween>

      {/* Alert Detail Drawer */}
      <AlertDetailDrawer
        alert={selectedAlert}
        visible={drawerVisible}
        onDismiss={() => {
          setDrawerVisible(false);
          setSelectedAlertId(null);
        }}
        onAcknowledge={handleAcknowledge}
        onResolve={handleResolve}
      />
    </ContentLayout>
  );
}
