// Dataset Selector Component
// Displays available sample datasets for selection

import Cards from '@cloudscape-design/components/cards';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Badge from '@cloudscape-design/components/badge';
import Box from '@cloudscape-design/components/box';
import Select from '@cloudscape-design/components/select';
import type { SelectProps } from '@cloudscape-design/components/select';
import Icon from '@cloudscape-design/components/icon';
import type { IconProps } from '@cloudscape-design/components/icon';
import type { DatasetType, DatasetDefinition } from '../data/sampleDatasets/types';
import { DATASET_DEFINITIONS } from '../data/sampleDatasets/registry';

// Map dataset icon strings to valid CloudScape icon names
function getIconName(icon: string): IconProps.Name {
  const iconMap: Record<string, IconProps.Name> = {
    'cart': 'file',
    'status-positive': 'status-positive',
    'multiscreen': 'share',
    'user-profile': 'user-profile',
    'key': 'key',
    'ecommerce': 'file',
    'iot': 'status-positive',
    'saas': 'share',
    'healthcare': 'user-profile',
    'financial': 'key',
  };
  return iconMap[icon] || 'folder';
}

interface DatasetSelectorProps {
  selectedDataset: DatasetType | null;
  onSelect: (datasetType: DatasetType) => void;
  mode?: 'cards' | 'dropdown';
}

export default function DatasetSelector({
  selectedDataset,
  onSelect,
  mode = 'cards',
}: DatasetSelectorProps) {
  // Dropdown mode
  if (mode === 'dropdown') {
    const options: SelectProps.Option[] = DATASET_DEFINITIONS.map((d) => ({
      value: d.id,
      label: d.name,
      description: d.description,
    }));

    const selectedOption = selectedDataset
      ? options.find((o) => o.value === selectedDataset) || null
      : null;

    return (
      <Select
        selectedOption={selectedOption}
        options={options}
        onChange={({ detail }) => {
          if (detail.selectedOption?.value) {
            onSelect(detail.selectedOption.value as DatasetType);
          }
        }}
        placeholder="Choose a sample dataset"
        filteringType="auto"
      />
    );
  }

  // Cards mode
  const selectedItem = selectedDataset
    ? DATASET_DEFINITIONS.find((d) => d.id === selectedDataset)
    : undefined;

  return (
    <Cards
      items={DATASET_DEFINITIONS}
      cardDefinition={{
        header: (item: DatasetDefinition) => (
          <SpaceBetween direction="horizontal" size="xs" alignItems="center">
            <Icon name={getIconName(item.icon)} />
            <Box fontWeight="bold">{item.name}</Box>
          </SpaceBetween>
        ),
        sections: [
          {
            id: 'description',
            content: (item: DatasetDefinition) => (
              <Box color="text-body-secondary" fontSize="body-s">
                {item.description}
              </Box>
            ),
          },
          {
            id: 'useCases',
            content: (item: DatasetDefinition) => (
              <SpaceBetween direction="horizontal" size="xs">
                {item.useCases.slice(0, 2).map((uc) => (
                  <Badge key={uc} color="blue">
                    {uc}
                  </Badge>
                ))}
              </SpaceBetween>
            ),
          },
        ],
      }}
      selectionType="single"
      selectedItems={selectedItem ? [selectedItem] : []}
      onSelectionChange={({ detail }) => {
        const selected = detail.selectedItems[0] as DatasetDefinition | undefined;
        if (selected) {
          onSelect(selected.id);
        }
      }}
      trackBy="id"
      empty="No datasets available"
    />
  );
}
