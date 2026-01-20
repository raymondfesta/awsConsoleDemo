import { useState } from 'react';
import Table from '@cloudscape-design/components/table';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import TextFilter from '@cloudscape-design/components/text-filter';
import Pagination from '@cloudscape-design/components/pagination';
import type { Product } from '../types';

interface ProductTableProps {
  products: Product[];
  onEdit?: (product: Product) => void;
  onDelete?: (id: string) => void;
}

export default function ProductTable({ products, onEdit, onDelete }: ProductTableProps) {
  const [selectedItems, setSelectedItems] = useState<Product[]>([]);
  const [filteringText, setFilteringText] = useState('');
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const pageSize = 5;

  const filteredProducts = products.filter((product) =>
    Object.values(product).some((value) =>
      value.toString().toLowerCase().includes(filteringText.toLowerCase())
    )
  );

  const paginatedProducts = filteredProducts.slice(
    (currentPageIndex - 1) * pageSize,
    currentPageIndex * pageSize
  );

  return (
    <Table
      columnDefinitions={[
        {
          id: 'name',
          header: 'Name',
          cell: (item) => item.name,
          sortingField: 'name',
        },
        {
          id: 'category',
          header: 'Category',
          cell: (item) => item.category,
          sortingField: 'category',
        },
        {
          id: 'price',
          header: 'Price',
          cell: (item) => `$${item.price.toFixed(2)}`,
          sortingField: 'price',
        },
        {
          id: 'stock',
          header: 'Stock',
          cell: (item) => item.stock,
          sortingField: 'stock',
        },
        {
          id: 'status',
          header: 'Status',
          cell: (item) => item.status,
          sortingField: 'status',
        },
        {
          id: 'actions',
          header: 'Actions',
          cell: (item) => (
            <SpaceBetween direction="horizontal" size="xs">
              <Button onClick={() => onEdit?.(item)}>Edit</Button>
              <Button onClick={() => onDelete?.(item.id)}>Delete</Button>
            </SpaceBetween>
          ),
        },
      ]}
      items={paginatedProducts}
      selectionType="multi"
      selectedItems={selectedItems}
      onSelectionChange={({ detail }) => setSelectedItems(detail.selectedItems)}
      header={
        <Header
          counter={`(${filteredProducts.length})`}
          actions={
            <Button variant="primary" disabled={selectedItems.length === 0}>
              Delete selected
            </Button>
          }
        >
          Products
        </Header>
      }
      filter={
        <TextFilter
          filteringText={filteringText}
          filteringPlaceholder="Find products"
          onChange={({ detail }) => setFilteringText(detail.filteringText)}
        />
      }
      pagination={
        <Pagination
          currentPageIndex={currentPageIndex}
          pagesCount={Math.ceil(filteredProducts.length / pageSize)}
          onChange={({ detail }) => setCurrentPageIndex(detail.currentPageIndex)}
        />
      }
      empty={
        <Box textAlign="center" color="inherit">
          <b>No products</b>
          <Box padding={{ bottom: 's' }} variant="p" color="inherit">
            No products to display.
          </Box>
        </Box>
      }
    />
  );
}
