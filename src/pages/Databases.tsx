import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Table from '@cloudscape-design/components/table';
import Header from '@cloudscape-design/components/header';
import Button from '@cloudscape-design/components/button';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Box from '@cloudscape-design/components/box';
import Link from '@cloudscape-design/components/link';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import TextFilter from '@cloudscape-design/components/text-filter';
import Pagination from '@cloudscape-design/components/pagination';
import CollectionPreferences from '@cloudscape-design/components/collection-preferences';
import { useAppStore, type DatabaseCluster } from '../context/AppContext';
import { useChatContext } from '../context/ChatContext';

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

// Column definitions
const columnDefinitions = [
  {
    id: 'name',
    header: 'Cluster name',
    cell: (item: DatabaseCluster) => <Link href={`/database-details?id=${item.id}`}>{item.name}</Link>,
    sortingField: 'name',
    minWidth: 200,
  },
  {
    id: 'status',
    header: 'Status',
    cell: (item: DatabaseCluster) => (
      <StatusIndicator type={getStatusType(item.status)}>
        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
      </StatusIndicator>
    ),
    sortingField: 'status',
    minWidth: 120,
  },
  {
    id: 'engine',
    header: 'Engine',
    cell: (item: DatabaseCluster) => item.engine,
    sortingField: 'engine',
    minWidth: 150,
  },
  {
    id: 'region',
    header: 'Region',
    cell: (item: DatabaseCluster) => item.region,
    sortingField: 'region',
    minWidth: 120,
  },
  {
    id: 'endpoint',
    header: 'Endpoint',
    cell: (item: DatabaseCluster) => item.endpoint || '-',
    minWidth: 250,
  },
  {
    id: 'createdAt',
    header: 'Created',
    cell: (item: DatabaseCluster) => formatDate(item.createdAt),
    sortingField: 'createdAt',
    minWidth: 180,
  },
];

export default function Databases() {
  const navigate = useNavigate();
  const { databases } = useAppStore();
  const { setDrawerOpen } = useChatContext();

  const [filteringText, setFilteringText] = useState('');
  const [selectedItems, setSelectedItems] = useState<DatabaseCluster[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [visibleColumns, setVisibleColumns] = useState(['name', 'status', 'engine', 'region', 'createdAt']);

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

  // Handle create database
  const handleCreateDatabase = () => {
    setDrawerOpen(false);
    navigate('/create-database');
  };

  // Empty state - standard Cloudscape pattern
  const EmptyState = () => (
    <Box textAlign="center" color="inherit">
      <b>No database clusters</b>
      <Box padding={{ bottom: 's' }} variant="p" color="inherit">
        No database clusters to display.
      </Box>
      <Button onClick={handleCreateDatabase}>Create database</Button>
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

  return (
    <ContentLayout
      defaultPadding
      header={
        <Header
          variant="h1"
          description="View and manage your Aurora DSQL database clusters"
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button
                disabled={selectedItems.length === 0}
                onClick={() => {/* Delete action */}}
              >
                Delete
              </Button>
              <Button variant="primary" onClick={handleCreateDatabase}>
                Create database
              </Button>
            </SpaceBetween>
          }
          counter={databases.length > 0 ? `(${databases.length})` : undefined}
        >
          Database clusters
        </Header>
      }
    >
      <Table
        variant="full-page"
        stickyHeader
        columnDefinitions={columnDefinitions}
        items={paginatedItems}
        selectionType="multi"
        selectedItems={selectedItems}
        onSelectionChange={({ detail }) => setSelectedItems(detail.selectedItems)}
        trackBy="id"
        empty={filteringText ? <NoMatchState /> : <EmptyState />}
        columnDisplay={visibleColumns.map((id) => ({ id, visible: true }))}
        filter={
          <TextFilter
            filteringPlaceholder="Search databases"
            filteringText={filteringText}
            onChange={({ detail }) => setFilteringText(detail.filteringText)}
          />
        }
        header={
          <Header
            counter={
              selectedItems.length
                ? `(${selectedItems.length}/${filteredItems.length})`
                : `(${filteredItems.length})`
            }
          >
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
        preferences={
          <CollectionPreferences
            title="Preferences"
            confirmLabel="Confirm"
            cancelLabel="Cancel"
            preferences={{
              pageSize,
              visibleContent: visibleColumns,
            }}
            pageSizePreference={{
              title: 'Page size',
              options: [
                { value: 10, label: '10 items' },
                { value: 20, label: '20 items' },
                { value: 50, label: '50 items' },
              ],
            }}
            visibleContentPreference={{
              title: 'Select visible columns',
              options: [
                {
                  label: 'Cluster properties',
                  options: columnDefinitions.map((col) => ({
                    id: col.id,
                    label: col.header,
                  })),
                },
              ],
            }}
            onConfirm={({ detail }) => {
              setPageSize(detail.pageSize || 10);
              setVisibleColumns([...(detail.visibleContent || ['name', 'status', 'engine', 'region', 'createdAt'])]);
            }}
          />
        }
      />
    </ContentLayout>
  );
}
