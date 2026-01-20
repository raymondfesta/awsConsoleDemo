import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Container from '@cloudscape-design/components/container';
import Badge from '@cloudscape-design/components/badge';
import Button from '@cloudscape-design/components/button';
import Popover from '@cloudscape-design/components/popover';
import ExpandableSection from '@cloudscape-design/components/expandable-section';
import type { TableDefinition, Relationship } from '../data/ecommerceSampleSchema';

interface SchemaVisualizationProps {
  tables: TableDefinition[];
  relationships: Relationship[];
  onTableSelect?: (tableName: string) => void;
  onRemoveTable?: (tableName: string) => void;
  interactive?: boolean;
  selectedTables?: string[];
}

// Colors for different table categories
const CATEGORY_COLORS: Record<string, string> = {
  Core: '#0972d3',
  Catalog: '#037f0c',
  Operations: '#d91515',
  Analytics: '#8b5cf6',
};

interface TableCardProps {
  table: TableDefinition;
  isSelected: boolean;
  onSelect?: () => void;
  onRemove?: () => void;
  interactive?: boolean;
  relationships: Relationship[];
}

function TableCard({ table, isSelected, onSelect, onRemove, interactive, relationships }: TableCardProps) {
  const categoryColor = CATEGORY_COLORS[table.category] || '#545b64';
  const relatedTables = relationships
    .filter(r => r.from.table === table.name || r.to.table === table.name)
    .map(r => r.from.table === table.name ? r.to.table : r.from.table);

  return (
    <div
      style={{
        border: `2px solid ${isSelected ? categoryColor : '#e9ebed'}`,
        borderRadius: '8px',
        backgroundColor: isSelected ? '#f2f8fd' : '#ffffff',
        overflow: 'hidden',
        cursor: interactive ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
      }}
      onClick={onSelect}
    >
      {/* Table header */}
      <div
        style={{
          backgroundColor: categoryColor,
          padding: '8px 12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box fontWeight="bold">
          <span style={{ color: 'white' }}>{table.displayName}</span>
        </Box>
        <Badge color="grey">{table.recordCount.toLocaleString()} rows</Badge>
      </div>

      {/* Table columns */}
      <div style={{ padding: '8px 12px' }}>
        <SpaceBetween size="xxs">
          {table.columns.slice(0, 4).map((col) => (
            <div
              key={col.name}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '12px',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {col.primaryKey && <span style={{ color: '#d4a017' }}>🔑</span>}
                {col.foreignKey && <span style={{ color: '#0972d3' }}>🔗</span>}
                <span style={{ fontFamily: 'monospace' }}>{col.name}</span>
              </span>
              <span style={{ color: '#687078', fontSize: '11px' }}>
                {col.type.split('(')[0]}
              </span>
            </div>
          ))}
          {table.columns.length > 4 && (
            <Popover
              dismissButton={false}
              position="right"
              size="large"
              triggerType="text"
              content={
                <SpaceBetween size="xxs">
                  {table.columns.map((col) => (
                    <div
                      key={col.name}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '16px',
                        fontSize: '12px',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {col.primaryKey && <span>🔑</span>}
                        {col.foreignKey && <span>🔗</span>}
                        <span style={{ fontFamily: 'monospace' }}>{col.name}</span>
                      </span>
                      <span style={{ color: '#687078' }}>{col.type}</span>
                    </div>
                  ))}
                </SpaceBetween>
              }
            >
              <span style={{ color: '#0972d3', cursor: 'pointer', fontSize: '12px' }}>
                +{table.columns.length - 4} more columns
              </span>
            </Popover>
          )}
        </SpaceBetween>
      </div>

      {/* Related tables */}
      {relatedTables.length > 0 && (
        <div style={{ padding: '8px 12px', borderTop: '1px solid #e9ebed' }}>
          <Box fontSize="body-s" color="text-body-secondary">
            Links to: {relatedTables.join(', ')}
          </Box>
        </div>
      )}

      {/* Action button */}
      {interactive && onRemove && (
        <div style={{ padding: '8px 12px', borderTop: '1px solid #e9ebed' }}>
          <Button
            variant="link"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            Remove table
          </Button>
        </div>
      )}
    </div>
  );
}

export default function SchemaVisualization({
  tables,
  relationships,
  onTableSelect,
  onRemoveTable,
  interactive = false,
  selectedTables,
}: SchemaVisualizationProps) {
  // Group tables by category
  const tablesByCategory = tables.reduce((acc, table) => {
    if (!acc[table.category]) {
      acc[table.category] = [];
    }
    acc[table.category].push(table);
    return acc;
  }, {} as Record<string, TableDefinition[]>);

  const categories = Object.keys(tablesByCategory);

  return (
    <SpaceBetween size="l">
      <Box>
        <Box variant="h2" fontSize="heading-l" fontWeight="bold">
          Schema Overview
        </Box>
        <Box color="text-body-secondary" margin={{ top: 'xs' }}>
          {tables.length} tables with {relationships.length} relationships
        </Box>
      </Box>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {categories.map((category) => (
          <div key={category} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '2px',
                backgroundColor: CATEGORY_COLORS[category] || '#545b64',
              }}
            />
            <span style={{ fontSize: '13px' }}>{category}</span>
            <span style={{ fontSize: '12px', color: '#687078' }}>
              ({tablesByCategory[category].length})
            </span>
          </div>
        ))}
      </div>

      {/* Tables grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
        }}
      >
        {tables.map((table) => (
          <TableCard
            key={table.name}
            table={table}
            isSelected={selectedTables?.includes(table.name) ?? true}
            onSelect={interactive && onTableSelect ? () => onTableSelect(table.name) : undefined}
            onRemove={interactive && onRemoveTable ? () => onRemoveTable(table.name) : undefined}
            interactive={interactive}
            relationships={relationships}
          />
        ))}
      </div>

      {/* Relationships section */}
      <ExpandableSection
        headerText={`Relationships (${relationships.length})`}
        variant="footer"
      >
        <Container>
          <SpaceBetween size="xs">
            {relationships.map((rel, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                }}
              >
                <span style={{ color: '#0972d3' }}>{rel.from.table}</span>
                <span>.{rel.from.column}</span>
                <span style={{ color: '#687078' }}>→</span>
                <span style={{ color: '#037f0c' }}>{rel.to.table}</span>
                <span>.{rel.to.column}</span>
                <Badge color="grey">{rel.type}</Badge>
              </div>
            ))}
          </SpaceBetween>
        </Container>
      </ExpandableSection>
    </SpaceBetween>
  );
}
