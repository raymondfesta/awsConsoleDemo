import type { ComponentType } from 'react';

// Custom components
import CodeView from './CodeView';

// E-commerce demo components
import WhatsNextPanel from '../WhatsNextPanel';
import SchemaVisualization from '../SchemaVisualization';
import SampleDatasetCard from '../SampleDatasetCard';
import ImportProgressPanel from '../ImportProgressPanel';
import QueryExplorer from '../QueryExplorer';

// Import all Cloudscape components
// Core Layout
import Alert from '@cloudscape-design/components/alert';
import AppLayout from '@cloudscape-design/components/app-layout';
import Badge from '@cloudscape-design/components/badge';
import Box from '@cloudscape-design/components/box';
import BreadcrumbGroup from '@cloudscape-design/components/breadcrumb-group';
import Button from '@cloudscape-design/components/button';
import ButtonDropdown from '@cloudscape-design/components/button-dropdown';
import ButtonGroup from '@cloudscape-design/components/button-group';
import Calendar from '@cloudscape-design/components/calendar';
import Cards from '@cloudscape-design/components/cards';
import Checkbox from '@cloudscape-design/components/checkbox';
import CodeEditor from '@cloudscape-design/components/code-editor';
import CollectionPreferences from '@cloudscape-design/components/collection-preferences';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Container from '@cloudscape-design/components/container';
import ContentLayout from '@cloudscape-design/components/content-layout';
import CopyToClipboard from '@cloudscape-design/components/copy-to-clipboard';
import DateInput from '@cloudscape-design/components/date-input';
import DatePicker from '@cloudscape-design/components/date-picker';
import DateRangePicker from '@cloudscape-design/components/date-range-picker';
import Drawer from '@cloudscape-design/components/drawer';
import ExpandableSection from '@cloudscape-design/components/expandable-section';
import FileDropzone from '@cloudscape-design/components/file-dropzone';
import FileInput from '@cloudscape-design/components/file-input';
import FileTokenGroup from '@cloudscape-design/components/file-token-group';
import FileUpload from '@cloudscape-design/components/file-upload';
import Flashbar from '@cloudscape-design/components/flashbar';
import Form from '@cloudscape-design/components/form';
import FormField from '@cloudscape-design/components/form-field';
import Grid from '@cloudscape-design/components/grid';
import Header from '@cloudscape-design/components/header';
import HelpPanel from '@cloudscape-design/components/help-panel';
import Hotspot from '@cloudscape-design/components/hotspot';
import Icon from '@cloudscape-design/components/icon';
import Input from '@cloudscape-design/components/input';
import KeyValuePairs from '@cloudscape-design/components/key-value-pairs';
import Link from '@cloudscape-design/components/link';
import Modal from '@cloudscape-design/components/modal';
import Multiselect from '@cloudscape-design/components/multiselect';
import Pagination from '@cloudscape-design/components/pagination';
import Popover from '@cloudscape-design/components/popover';
import ProgressBar from '@cloudscape-design/components/progress-bar';
import RadioGroup from '@cloudscape-design/components/radio-group';
import SegmentedControl from '@cloudscape-design/components/segmented-control';
import Select from '@cloudscape-design/components/select';
import SideNavigation from '@cloudscape-design/components/side-navigation';
import Slider from '@cloudscape-design/components/slider';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Spinner from '@cloudscape-design/components/spinner';
import SplitPanel from '@cloudscape-design/components/split-panel';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import Steps from '@cloudscape-design/components/steps';
import Table from '@cloudscape-design/components/table';
import Tabs from '@cloudscape-design/components/tabs';
import TagEditor from '@cloudscape-design/components/tag-editor';
import TextContent from '@cloudscape-design/components/text-content';
import TextFilter from '@cloudscape-design/components/text-filter';
import Textarea from '@cloudscape-design/components/textarea';
import Tiles from '@cloudscape-design/components/tiles';
import TimeInput from '@cloudscape-design/components/time-input';
import Toggle from '@cloudscape-design/components/toggle';
import ToggleButton from '@cloudscape-design/components/toggle-button';
import TokenGroup from '@cloudscape-design/components/token-group';
import TopNavigation from '@cloudscape-design/components/top-navigation';
import Wizard from '@cloudscape-design/components/wizard';

// Charts (if available)
import LineChart from '@cloudscape-design/components/line-chart';
import BarChart from '@cloudscape-design/components/bar-chart';
import PieChart from '@cloudscape-design/components/pie-chart';
import AreaChart from '@cloudscape-design/components/area-chart';
import MixedLineBarChart from '@cloudscape-design/components/mixed-line-bar-chart';

// Component Registry - Maps string type names to actual components
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ComponentRegistry: Record<string, ComponentType<any>> = {
  // Core Layout
  Alert,
  AppLayout,
  Badge,
  Box,
  BreadcrumbGroup,
  Button,
  ButtonDropdown,
  ButtonGroup,
  Calendar,
  Cards,
  Checkbox,
  CodeEditor,
  CollectionPreferences,
  ColumnLayout,
  Container,
  ContentLayout,
  CopyToClipboard,
  DateInput,
  DatePicker,
  DateRangePicker,
  Drawer,
  ExpandableSection,
  FileDropzone,
  FileInput,
  FileTokenGroup,
  FileUpload,
  Flashbar,
  Form,
  FormField,
  Grid,
  Header,
  HelpPanel,
  Hotspot,
  Icon,
  Input,
  KeyValuePairs,
  Link,
  Modal,
  Multiselect,
  Pagination,
  Popover,
  ProgressBar,
  RadioGroup,
  SegmentedControl,
  Select,
  SideNavigation,
  Slider,
  SpaceBetween,
  Spinner,
  SplitPanel,
  StatusIndicator,
  Steps,
  Table,
  Tabs,
  TagEditor,
  TextContent,
  TextFilter,
  Textarea,
  Tiles,
  TimeInput,
  Toggle,
  ToggleButton,
  TokenGroup,
  TopNavigation,
  Wizard,

  // Charts
  LineChart,
  BarChart,
  PieChart,
  AreaChart,
  MixedLineBarChart,

  // Custom components
  CodeView,  // Read-only code snippet display following GenAI patterns

  // E-commerce demo components
  WhatsNextPanel,
  SchemaVisualization,
  SampleDatasetCard,
  ImportProgressPanel,
  QueryExplorer,
};

// Kebab-case to PascalCase mapping for component names
export const componentNameMap: Record<string, string> = {
  'alert': 'Alert',
  'app-layout': 'AppLayout',
  'badge': 'Badge',
  'box': 'Box',
  'breadcrumb-group': 'BreadcrumbGroup',
  'button': 'Button',
  'button-dropdown': 'ButtonDropdown',
  'button-group': 'ButtonGroup',
  'calendar': 'Calendar',
  'cards': 'Cards',
  'checkbox': 'Checkbox',
  'code-editor': 'CodeEditor',
  'collection-preferences': 'CollectionPreferences',
  'column-layout': 'ColumnLayout',
  'container': 'Container',
  'content-layout': 'ContentLayout',
  'copy-to-clipboard': 'CopyToClipboard',
  'date-input': 'DateInput',
  'date-picker': 'DatePicker',
  'date-range-picker': 'DateRangePicker',
  'drawer': 'Drawer',
  'expandable-section': 'ExpandableSection',
  'file-dropzone': 'FileDropzone',
  'file-input': 'FileInput',
  'file-token-group': 'FileTokenGroup',
  'file-upload': 'FileUpload',
  'flashbar': 'Flashbar',
  'form': 'Form',
  'form-field': 'FormField',
  'grid': 'Grid',
  'header': 'Header',
  'help-panel': 'HelpPanel',
  'hotspot': 'Hotspot',
  'icon': 'Icon',
  'input': 'Input',
  'key-value-pairs': 'KeyValuePairs',
  'link': 'Link',
  'modal': 'Modal',
  'multiselect': 'Multiselect',
  'pagination': 'Pagination',
  'popover': 'Popover',
  'progress-bar': 'ProgressBar',
  'radio-group': 'RadioGroup',
  'segmented-control': 'SegmentedControl',
  'select': 'Select',
  'side-navigation': 'SideNavigation',
  'slider': 'Slider',
  'space-between': 'SpaceBetween',
  'spinner': 'Spinner',
  'split-panel': 'SplitPanel',
  'status-indicator': 'StatusIndicator',
  'steps': 'Steps',
  'table': 'Table',
  'tabs': 'Tabs',
  'tag-editor': 'TagEditor',
  'text-content': 'TextContent',
  'text-filter': 'TextFilter',
  'textarea': 'Textarea',
  'tiles': 'Tiles',
  'time-input': 'TimeInput',
  'toggle': 'Toggle',
  'toggle-button': 'ToggleButton',
  'token-group': 'TokenGroup',
  'top-navigation': 'TopNavigation',
  'wizard': 'Wizard',
  'line-chart': 'LineChart',
  'bar-chart': 'BarChart',
  'pie-chart': 'PieChart',
  'area-chart': 'AreaChart',
  'mixed-line-bar-chart': 'MixedLineBarChart',
  'code-view': 'CodeView',
  // E-commerce demo components
  'whats-next-panel': 'WhatsNextPanel',
  'schema-visualization': 'SchemaVisualization',
  'sample-dataset-card': 'SampleDatasetCard',
  'import-progress-panel': 'ImportProgressPanel',
  'query-explorer': 'QueryExplorer',
};

/**
 * Get component from registry by name (supports both PascalCase and kebab-case)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getComponent(name: string): ComponentType<any> | null {
  // Try direct lookup first (PascalCase)
  if (ComponentRegistry[name]) {
    return ComponentRegistry[name];
  }

  // Try kebab-case mapping
  const pascalName = componentNameMap[name.toLowerCase()];
  if (pascalName && ComponentRegistry[pascalName]) {
    return ComponentRegistry[pascalName];
  }

  return null;
}

export default ComponentRegistry;
