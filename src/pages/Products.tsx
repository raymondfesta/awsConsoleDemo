import { useState } from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Button from '@cloudscape-design/components/button';
import ProductTable from '../components/ProductTable';
import ProductModal from '../components/ProductModal';
import { useAppStore } from '../context/AppContext';
import type { Product } from '../types';

export default function Products() {
  const { products, addProduct, updateProduct, deleteProduct, addNotification } = useAppStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    deleteProduct(id);
    addNotification({
      type: 'success',
      content: 'Product deleted successfully',
      dismissible: true,
    });
  };

  const handleSubmit = (product: Product) => {
    if (editingProduct) {
      updateProduct(product.id, product);
      addNotification({
        type: 'success',
        content: 'Product updated successfully',
        dismissible: true,
      });
    } else {
      addProduct(product);
      addNotification({
        type: 'success',
        content: 'Product created successfully',
        dismissible: true,
      });
    }
    setEditingProduct(undefined);
  };

  return (
    <SpaceBetween size="l">
      <Header
        variant="h1"
        actions={
          <Button
            variant="primary"
            onClick={() => {
              setEditingProduct(undefined);
              setModalVisible(true);
            }}
          >
            Add Product
          </Button>
        }
      >
        Products
      </Header>
      <Container>
        <ProductTable products={products} onEdit={handleEdit} onDelete={handleDelete} />
      </Container>
      <ProductModal
        visible={modalVisible}
        product={editingProduct}
        onDismiss={() => {
          setModalVisible(false);
          setEditingProduct(undefined);
        }}
        onSubmit={handleSubmit}
      />
    </SpaceBetween>
  );
}
