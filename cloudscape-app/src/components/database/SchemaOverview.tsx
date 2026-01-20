import { useState } from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Table from '@cloudscape-design/components/table';
import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';
import ExpandableSection from '@cloudscape-design/components/expandable-section';
import Icon from '@cloudscape-design/components/icon';
import Link from '@cloudscape-design/components/link';

export interface TableColumn {
  name: string;
  type: string;
  reference?: string;
}

export interface SchemaTable {
  name: string;
  displayName: string;
  columns: TableColumn[];
  rowCount: string;
}

// Mock schema data matching the mockup
export const MOCK_SCHEMA_TABLES: SchemaTable[] = [
  {
    name: 'users',
    displayName: 'users',
    rowCount: '12.315M rows',
    columns: [
      { name: 'user-id', type: 'uuid', reference: '-' },
      { name: 'first_name', type: 'char', reference: '-' },
      { name: 'last_name', type: 'char', reference: '-' },
      { name: 'last_update', type: 'timestamp', reference: '-' },
      { name: 'email', type: 'varchar', reference: '-' },
      { name: 'created_at', type: 'timestamp', reference: '-' },
      { name: 'status', type: 'varchar', reference: '-' },
      { name: 'role', type: 'varchar', reference: '-' },
    ],
  },
  {
    name: 'transactions',
    displayName: 'transactions',
    rowCount: '92.501M rows',
    columns: [
      { name: 'transaction_id', type: 'uuid', reference: '-' },
      { name: 'user_id', type: 'uuid', reference: 'users.user-id' },
      { name: 'amount', type: 'decimal', reference: '-' },
      { name: 'currency', type: 'char', reference: '-' },
      { name: 'status', type: 'varchar', reference: '-' },
      { name: 'created_at', type: 'timestamp', reference: '-' },
      { name: 'updated_at', type: 'timestamp', reference: '-' },
      { name: 'payment_method', type: 'varchar', reference: '-' },
      { name: 'description', type: 'text', reference: '-' },
      { name: 'metadata', type: 'jsonb', reference: '-' },
    ],
  },
  {
    name: 'products',
    displayName: 'products',
    rowCount: '10.173M rows',
    columns: [
      { name: 'product_id', type: 'uuid', reference: '-' },
      { name: 'name', type: 'varchar', reference: '-' },
      { name: 'description', type: 'text', reference: '-' },
      { name: 'price', type: 'decimal', reference: '-' },
      { name: 'category_id', type: 'uuid', reference: '-' },
      { name: 'stock_quantity', type: 'integer', reference: '-' },
      { name: 'created_at', type: 'timestamp', reference: '-' },
      { name: 'updated_at', type: 'timestamp', reference: '-' },
      { name: 'status', type: 'varchar', reference: '-' },
      { name: 'sku', type: 'varchar', reference: '-' },
      { name: 'weight', type: 'decimal', reference: '-' },
      { name: 'dimensions', type: 'jsonb', reference: '-' },
    ],
  },
  {
    name: 'orders',
    displayName: 'orders',
    rowCount: '62.565M rows',
    columns: [
      { name: 'order_id', type: 'uuid', reference: '-' },
      { name: 'user_id', type: 'uuid', reference: 'users.user-id' },
      { name: 'total_amount', type: 'decimal', reference: '-' },
      { name: 'status', type: 'varchar', reference: '-' },
      { name: 'created_at', type: 'timestamp', reference: '-' },
      { name: 'updated_at', type: 'timestamp', reference: '-' },
      { name: 'shipping_address', type: 'jsonb', reference: '-' },
      { name: 'billing_address', type: 'jsonb', reference: '-' },
      { name: 'payment_id', type: 'uuid', reference: 'transactions.transaction_id' },
      { name: 'notes', type: 'text', reference: '-' },
      { name: 'discount_code', type: 'varchar', reference: '-' },
      { name: 'tax_amount', type: 'decimal', reference: '-' },
      { name: 'shipping_cost', type: 'decimal', reference: '-' },
      { name: 'tracking_number', type: 'varchar', reference: '-' },
    ],
  },
  {
    name: 'analytics_events',
    displayName: 'analytics_events',
    rowCount: '64.619M rows',
    columns: [
      { name: 'event_id', type: 'uuid', reference: '-' },
      { name: 'user_id', type: 'uuid', reference: 'users.user-id' },
      { name: 'event_type', type: 'varchar', reference: '-' },
      { name: 'event_data', type: 'jsonb', reference: '-' },
      { name: 'timestamp', type: 'timestamp', reference: '-' },
      { name: 'session_id', type: 'uuid', reference: 'sessions.session_id' },
      { name: 'page_url', type: 'varchar', reference: '-' },
      { name: 'referrer', type: 'varchar', reference: '-' },
      { name: 'device_type', type: 'varchar', reference: '-' },
      { name: 'browser', type: 'varchar', reference: '-' },
      { name: 'os', type: 'varchar', reference: '-' },
      { name: 'country', type: 'char', reference: '-' },
      { name: 'city', type: 'varchar', reference: '-' },
      { name: 'ip_address', type: 'inet', reference: '-' },
      { name: 'utm_source', type: 'varchar', reference: '-' },
      { name: 'utm_campaign', type: 'varchar', reference: '-' },
    ],
  },
  {
    name: 'sessions',
    displayName: 'sessions',
    rowCount: '96.124M rows',
    columns: [
      { name: 'session_id', type: 'uuid', reference: '-' },
      { name: 'user_id', type: 'uuid', reference: 'users.user-id' },
      { name: 'started_at', type: 'timestamp', reference: '-' },
      { name: 'ended_at', type: 'timestamp', reference: '-' },
      { name: 'ip_address', type: 'inet', reference: '-' },
      { name: 'user_agent', type: 'text', reference: '-' },
      { name: 'device_id', type: 'varchar', reference: '-' },
      { name: 'location', type: 'jsonb', reference: '-' },
      { name: 'is_authenticated', type: 'boolean', reference: '-' },
      { name: 'auth_method', type: 'varchar', reference: '-' },
      { name: 'duration_seconds', type: 'integer', reference: '-' },
      { name: 'page_views', type: 'integer', reference: '-' },
      { name: 'actions', type: 'integer', reference: '-' },
      { name: 'conversions', type: 'integer', reference: '-' },
      { name: 'revenue', type: 'decimal', reference: '-' },
      { name: 'exit_page', type: 'varchar', reference: '-' },
      { name: 'entry_page', type: 'varchar', reference: '-' },
      { name: 'bounce', type: 'boolean', reference: '-' },
    ],
  },
];

interface SchemaOverviewProps {
  tables?: SchemaTable[];
  onTableSelect?: (table: SchemaTable) => void;
}

export default function SchemaOverview({
  tables = MOCK_SCHEMA_TABLES,
  onTableSelect: _onTableSelect,
}: SchemaOverviewProps) {
  const [expandedTable, setExpandedTable] = useState<string | null>('users');
  const [showAll, setShowAll] = useState(false);

  const displayedTables = showAll ? tables : tables.slice(0, 6);

  return (
    <Container
      header={
        <Header variant="h3">
          <SpaceBetween direction="horizontal" size="xs" alignItems="center">
            <Icon name="folder" />
            <span>Schema Overview ({tables.length} tables)</span>
          </SpaceBetween>
        </Header>
      }
    >
      <SpaceBetween size="xs">
        {displayedTables.map((table) => (
          <ExpandableSection
            key={table.name}
            variant="container"
            expanded={expandedTable === table.name}
            onChange={({ detail }) =>
              setExpandedTable(detail.expanded ? table.name : null)
            }
            headerText={
              <SpaceBetween direction="horizontal" size="s">
                <Icon name="folder" />
                <span>{table.displayName}</span>
              </SpaceBetween>
            }
            headerDescription={`${table.columns.length} columns    ${table.rowCount}`}
          >
            <Table
              items={table.columns}
              columnDefinitions={[
                {
                  id: 'column',
                  header: 'Column',
                  cell: (item) => item.name,
                  width: 150,
                },
                {
                  id: 'type',
                  header: 'Type',
                  cell: (item) => <Box color="text-body-secondary">{item.type}</Box>,
                  width: 100,
                },
                {
                  id: 'reference',
                  header: 'Reference',
                  cell: (item) => (
                    <Box color="text-body-secondary">
                      {item.reference !== '-' ? (
                        <Link>{item.reference}</Link>
                      ) : (
                        item.reference
                      )}
                    </Box>
                  ),
                  width: 150,
                },
              ]}
              variant="embedded"
              wrapLines
              stripedRows
            />
          </ExpandableSection>
        ))}
        {tables.length > 6 && (
          <Link onFollow={() => setShowAll(!showAll)}>
            {showAll ? 'Show less' : `View all ${tables.length} tables`}
          </Link>
        )}
      </SpaceBetween>
    </Container>
  );
}
