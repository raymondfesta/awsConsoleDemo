import { useState } from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Button from '@cloudscape-design/components/button';
import Badge from '@cloudscape-design/components/badge';
import Table from '@cloudscape-design/components/table';
import Checkbox from '@cloudscape-design/components/checkbox';
import ExpandableSection from '@cloudscape-design/components/expandable-section';
import KeyValuePairs from '@cloudscape-design/components/key-value-pairs';
import type { EcommerceSchema } from '../data/ecommerceSampleSchema';

interface SampleDatasetCardProps {
  schema: EcommerceSchema;
  onImport: (selectedTables: string[]) => void;
  onPreviewSchema: () => void;
  onCustomize?: () => void;
}

export default function SampleDatasetCard({
  schema,
  onImport,
  onPreviewSchema,
  onCustomize,
}: SampleDatasetCardProps) {
  const [selectedTableNames, setSelectedTableNames] = useState<string[]>(
    schema.tables.map((t) => t.name)
  );

  const toggleTable = (tableName: string) => {
    setSelectedTableNames((prev) =>
      prev.includes(tableName)
        ? prev.filter((t) => t !== tableName)
        : [...prev, tableName]
    );
  };

  const selectedTables = schema.tables.filter((t) =>
    selectedTableNames.includes(t.name)
  );
  const totalRecords = selectedTables.reduce((sum, t) => sum + t.recordCount, 0);

  return (
    <Container
      header={
        <Header
          variant="h2"
          description="Pre-built sample dataset following e-commerce best practices"
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button onClick={onPreviewSchema}>Preview schema</Button>
              <Button variant="primary" onClick={() => onImport(selectedTableNames)}>
                Import dataset
              </Button>
            </SpaceBetween>
          }
        >
          E-commerce & Retail Sample Dataset
        </Header>
      }
    >
      <SpaceBetween size="l">
        {/* Overview stats */}
        <KeyValuePairs
          columns={4}
          items={[
            {
              label: 'Tables',
              value: (
                <SpaceBetween direction="horizontal" size="xs">
                  <span>{selectedTables.length}</span>
                  {selectedTables.length < schema.tables.length && (
                    <Badge color="grey">
                      {schema.tables.length - selectedTables.length} excluded
                    </Badge>
                  )}
                </SpaceBetween>
              ),
            },
            { label: 'Total records', value: totalRecords.toLocaleString() },
            { label: 'Relationships', value: schema.relationships.length.toString() },
            {
              label: 'Categories',
              value: schema.categories.slice(0, 3).join(', ') + '...',
            },
          ]}
        />

        {/* Tables list with checkboxes */}
        <Table
          columnDefinitions={[
            {
              id: 'select',
              header: '',
              cell: (item) => (
                <Checkbox
                  checked={selectedTableNames.includes(item.name)}
                  onChange={() => toggleTable(item.name)}
                />
              ),
              width: 50,
            },
            {
              id: 'name',
              header: 'Table',
              cell: (item) => (
                <Box fontWeight="bold">{item.displayName}</Box>
              ),
            },
            {
              id: 'records',
              header: 'Records',
              cell: (item) => item.recordCount.toLocaleString(),
            },
            {
              id: 'columns',
              header: 'Columns',
              cell: (item) => item.columns.length,
            },
            {
              id: 'category',
              header: 'Category',
              cell: (item) => <Badge>{item.category}</Badge>,
            },
            {
              id: 'description',
              header: 'Purpose',
              cell: (item) => (
                <Box color="text-body-secondary" fontSize="body-s">
                  {item.description}
                </Box>
              ),
            },
          ]}
          items={schema.tables}
          stripedRows
          variant="embedded"
        />

        {/* Customization options */}
        <ExpandableSection headerText="Customization options" variant="footer">
          <SpaceBetween size="m">
            <Box color="text-body-secondary">
              You can customize this dataset before importing:
            </Box>
            <SpaceBetween direction="horizontal" size="xs">
              <Button onClick={onCustomize}>
                Change product categories
              </Button>
              <Button onClick={onPreviewSchema}>
                View schema diagram
              </Button>
            </SpaceBetween>
          </SpaceBetween>
        </ExpandableSection>

        {/* What's included */}
        <ExpandableSection headerText="What's included" variant="footer">
          <SpaceBetween size="m">
            <Box>
              <Box fontWeight="bold">Realistic data patterns:</Box>
              <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                <li>8,500 unique customers with purchase history</li>
                <li>28,000 orders spanning 12 months</li>
                <li>1,200 fashion products across 7 categories</li>
                <li>Order status distribution (delivered, shipped, processing)</li>
                <li>Customer lifetime value calculations</li>
              </ul>
            </Box>
            <Box>
              <Box fontWeight="bold">Pre-built relationships:</Box>
              <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                <li>orders → customers (customer purchase history)</li>
                <li>order_items → orders, products (line item details)</li>
                <li>inventory → products (stock levels)</li>
                <li>shipping → customers (delivery addresses)</li>
              </ul>
            </Box>
          </SpaceBetween>
        </ExpandableSection>
      </SpaceBetween>
    </Container>
  );
}
