import { useState, useEffect } from 'react';
import Modal from '@cloudscape-design/components/modal';
import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Button from '@cloudscape-design/components/button';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import Select from '@cloudscape-design/components/select';
import type { Product } from '../types';

interface ProductModalProps {
  visible: boolean;
  product?: Product;
  onDismiss: () => void;
  onSubmit: (product: Product) => void;
}

export default function ProductModal({ visible, product, onDismiss, onSubmit }: ProductModalProps) {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: '',
    price: 0,
    stock: 0,
    status: 'active',
  });

  useEffect(() => {
    if (product) {
      setFormData(product);
    } else {
      setFormData({
        name: '',
        category: '',
        price: 0,
        stock: 0,
        status: 'active',
      });
    }
  }, [product]);

  const handleSubmit = () => {
    const newProduct: Product = {
      id: product?.id || Date.now().toString(),
      name: formData.name || '',
      category: formData.category || '',
      price: formData.price || 0,
      stock: formData.stock || 0,
      status: formData.status || 'active',
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    onSubmit(newProduct);
    onDismiss();
  };

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      header={product ? 'Edit Product' : 'Add Product'}
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="link" onClick={onDismiss}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              {product ? 'Update' : 'Create'}
            </Button>
          </SpaceBetween>
        </Box>
      }
    >
      <SpaceBetween size="m">
        <FormField label="Name">
          <Input
            value={formData.name || ''}
            onChange={({ detail }) => setFormData({ ...formData, name: detail.value })}
          />
        </FormField>
        <FormField label="Category">
          <Input
            value={formData.category || ''}
            onChange={({ detail }) => setFormData({ ...formData, category: detail.value })}
          />
        </FormField>
        <FormField label="Price">
          <Input
            type="number"
            value={formData.price?.toString() || '0'}
            onChange={({ detail }) => setFormData({ ...formData, price: parseFloat(detail.value) })}
          />
        </FormField>
        <FormField label="Stock">
          <Input
            type="number"
            value={formData.stock?.toString() || '0'}
            onChange={({ detail }) => setFormData({ ...formData, stock: parseInt(detail.value) })}
          />
        </FormField>
        <FormField label="Status">
          <Select
            selectedOption={{ label: formData.status || 'active', value: formData.status || 'active' }}
            onChange={({ detail }) =>
              setFormData({ ...formData, status: detail.selectedOption.value as 'active' | 'inactive' })
            }
            options={[
              { label: 'active', value: 'active' },
              { label: 'inactive', value: 'inactive' },
            ]}
          />
        </FormField>
      </SpaceBetween>
    </Modal>
  );
}
