import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import AppLayout from '@cloudscape-design/components/app-layout-toolbar';
import Flashbar from '@cloudscape-design/components/flashbar';
import BreadcrumbGroup from '@cloudscape-design/components/breadcrumb-group';
import SplitPanel from '@cloudscape-design/components/split-panel';
import Box from '@cloudscape-design/components/box';
import Header from '@cloudscape-design/components/header';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Navigation from './components/Navigation';
import TopNav from './components/TopNav';
import ChatInterface from './components/ChatInterface';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import DatabaseDetails from './pages/DatabaseDetails';
import Databases from './pages/Databases';
import CreateDatabase from './pages/CreateDatabase';
import ImportData from './pages/ImportData';
import AlertsDashboard from './pages/AlertsDashboard';
import Investigations from './pages/Investigations';
import Recommendations from './pages/Recommendations';
import AmazonDatabases from './pages/AmazonDatabases';
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
  '/alerts': { text: 'Alerts', parent: '/' },
  '/investigations': { text: 'AI Firefighter', parent: '/' },
  '/recommendations': { text: 'Recommendations', parent: '/' },
  '/amazon-databases': { text: 'Amazon Databases', parent: '/' },
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
  const { isDrawerOpen, setDrawerOpen, setNavigateCallback, splitPanelConfig, setSplitPanelConfig, creationStatus } = useChatContext();
  const isCreationActive = creationStatus === 'creating';
  const location = useLocation();
  const navigate = useNavigate();
  const [navigationOpen, setNavigationOpen] = useState(true);
  const [splitPanelOpen, setSplitPanelOpen] = useState(false);
  const [splitPanelSize, setSplitPanelSize] = useState(500);

  // Check if we're on a workflow page (hide drawer on these pages)
  const isWorkflowPage = location.pathname === '/create-database' || location.pathname === '/import-data';

  // Collapse navigation when entering workflow pages
  useEffect(() => {
    if (isWorkflowPage) {
      setNavigationOpen(false);
    }
  }, [isWorkflowPage]);

  // Sync splitPanelOpen with splitPanelConfig
  useEffect(() => {
    setSplitPanelOpen(!!splitPanelConfig);
  }, [splitPanelConfig]);

  // Register navigate callback for chat context
  useEffect(() => {
    setNavigateCallback(navigate);
  }, [navigate, setNavigateCallback]);

  const breadcrumbs = buildBreadcrumbs(location.pathname);

  return (
    <>
      <TopNav />
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
      drawers={(isWorkflowPage && !isCreationActive) ? [] : [
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
      activeDrawerId={(isWorkflowPage && !isCreationActive) ? null : (isDrawerOpen ? 'chat' : null)}
      onDrawerChange={({ detail }) => setDrawerOpen(detail.activeDrawerId === 'chat')}
      splitPanel={
        <SplitPanel
          header="Configuration Details"
          closeBehavior="hide"
          hidePreferencesButton
        >
          {splitPanelConfig ? (
            <SpaceBetween size="l">
              {splitPanelConfig.sections.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  <Header variant="h3">{section.title}</Header>
                  <Box margin={{ top: 'xs' }}>
                    <ColumnLayout columns={2} variant="text-grid">
                      {Object.entries(section.items).map(([key, value]) => (
                        <div key={key}>
                          <Box color="text-body-secondary" fontSize="body-s">{key}</Box>
                          <Box>{value}</Box>
                        </div>
                      ))}
                    </ColumnLayout>
                  </Box>
                </div>
              ))}
            </SpaceBetween>
          ) : null}
        </SplitPanel>
      }
      splitPanelOpen={splitPanelOpen}
      splitPanelSize={splitPanelSize}
      onSplitPanelToggle={({ detail }) => {
        setSplitPanelOpen(detail.open);
        if (!detail.open) {
          setSplitPanelConfig(null);
        }
      }}
      onSplitPanelResize={({ detail }) => setSplitPanelSize(detail.size)}
      splitPanelPreferences={{ position: 'side' }}
      onSplitPanelPreferencesChange={() => {}}
      content={
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/databases" element={<Databases />} />
          <Route path="/create-database" element={<CreateDatabase />} />
          <Route path="/database-details" element={<DatabaseDetails />} />
          <Route path="/import-data" element={<ImportData />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/alerts" element={<AlertsDashboard />} />
          <Route path="/investigations" element={<Investigations />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/amazon-databases" element={<AmazonDatabases />} />
        </Routes>
      }
    />
    </>
  );
}

function App() {
  const { theme } = useAppStore();

  // Apply dark mode class to document body for Cloudscape components
  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('awsui-dark-mode');
    } else {
      document.body.classList.remove('awsui-dark-mode');
    }
  }, [theme]);

  return (
    <ChatProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ChatProvider>
  );
}

export default App;
