import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import AppLayout from '@cloudscape-design/components/app-layout-toolbar';
import Flashbar from '@cloudscape-design/components/flashbar';
import BreadcrumbGroup from '@cloudscape-design/components/breadcrumb-group';
import Navigation from './components/Navigation';
import ChatInterface from './components/ChatInterface';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import CreateDatabase from './pages/CreateDatabase';
import ImportData from './pages/ImportData';
import DatabaseDetails from './pages/DatabaseDetails';
import Databases from './pages/Databases';
import { useAppStore } from './context/AppContext';
import { ChatProvider, useChatContext } from './context/ChatContext';
import '@cloudscape-design/global-styles/index.css';

// Breadcrumb configuration
const breadcrumbConfig: Record<string, { text: string; parent?: string }> = {
  '/': { text: 'Dashboard' },
  '/databases': { text: 'Clusters', parent: '/' },
  '/create-database': { text: 'Create database', parent: '/databases' },
  '/database-details': { text: 'Cluster details', parent: '/databases' },
  '/import-data': { text: 'Import data', parent: '/' },
  '/settings': { text: 'Settings', parent: '/' },
};

// Build breadcrumb items from path
function buildBreadcrumbs(pathname: string): Array<{ text: string; href: string }> {
  const items: Array<{ text: string; href: string }> = [];
  let currentPath = pathname;

  while (currentPath && breadcrumbConfig[currentPath]) {
    const config = breadcrumbConfig[currentPath];
    items.unshift({ text: config.text, href: currentPath });
    currentPath = config.parent || '';
  }

  // Always ensure root is present if not already
  if (items.length === 0 || items[0].href !== '/') {
    items.unshift({ text: 'UDE Console', href: '/' });
  } else {
    items[0].text = 'UDE Console';
  }

  return items;
}

function AppContent() {
  const { notifications, removeNotification } = useAppStore();
  const { isDrawerOpen, setDrawerOpen, endWorkflow, setNavigateCallback } = useChatContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [navigationOpen, setNavigationOpen] = useState(true);

  // Register navigate callback for chat context
  useEffect(() => {
    setNavigateCallback(navigate);
  }, [navigate, setNavigateCallback]);

  // Handle workflow pages - close navigation and end workflow when leaving
  useEffect(() => {
    const isWorkflowPage = location.pathname.startsWith('/create-database') ||
                           location.pathname.startsWith('/import-data');
    const isWorkflowRelatedPage = isWorkflowPage || location.pathname.startsWith('/database-details');

    // Close navigation on workflow pages
    if (isWorkflowPage) {
      setNavigationOpen(false);
    }

    // End workflow when navigating away from workflow-related pages
    if (!isWorkflowRelatedPage) {
      endWorkflow();
    }
  }, [location.pathname, endWorkflow]);

  const breadcrumbs = buildBreadcrumbs(location.pathname);

  return (
    <AppLayout
      contentType="default"
      breadcrumbs={
        <BreadcrumbGroup
          items={breadcrumbs}
          onFollow={(e) => {
            e.preventDefault();
            navigate(e.detail.href);
          }}
        />
      }
      navigationOpen={navigationOpen}
      onNavigationChange={({ detail }) => setNavigationOpen(detail.open)}
      navigation={<Navigation />}
      notifications={
        <Flashbar
          items={notifications.map((n) => ({
            ...n,
            onDismiss: () => removeNotification(n.id),
          }))}
        />
      }
      toolsHide
      drawers={[
        {
          id: 'chat',
          ariaLabels: {
            drawerName: 'AI Assistant',
            closeButton: 'Close assistant',
            triggerButton: 'Open AI assistant',
            resizeHandle: 'Resize assistant panel',
          },
          trigger: {
            iconName: 'contact',
          },
          content: <ChatInterface />,
          defaultSize: 420,
          resizable: true,
        },
      ]}
      activeDrawerId={isDrawerOpen ? 'chat' : null}
      onDrawerChange={({ detail }) => setDrawerOpen(detail.activeDrawerId === 'chat')}
      content={
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/databases" element={<Databases />} />
          <Route path="/create-database" element={<CreateDatabase />} />
          <Route path="/database-details" element={<DatabaseDetails />} />
          <Route path="/import-data" element={<ImportData />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      }
    />
  );
}

function App() {
  const { theme } = useAppStore();

  return (
    <ChatProvider>
      <div className={theme === 'dark' ? 'awsui-dark-mode' : ''}>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </div>
    </ChatProvider>
  );
}

export default App;
