import { useState } from 'react';
import Grid from '@cloudscape-design/components/grid';
import Container from '@cloudscape-design/components/container';
import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Icon from '@cloudscape-design/components/icon';
import Header from '@cloudscape-design/components/header';
import Modal from '@cloudscape-design/components/modal';
import Tabs from '@cloudscape-design/components/tabs';
import CopyToClipboard from '@cloudscape-design/components/copy-to-clipboard';
import Button from '@cloudscape-design/components/button';
import ColumnLayout from '@cloudscape-design/components/column-layout';

// Connection method card component
interface ConnectionMethodProps {
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  description: string;
  onClick?: () => void;
}

function ConnectionMethodCard({ icon, iconColor, title, description, onClick }: ConnectionMethodProps) {
  return (
    <div
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        height: '100%',
      }}
    >
      <Container fitHeight>
        <SpaceBetween size="s">
          <Box fontSize="heading-l">
            <span style={{ color: iconColor }}>{icon}</span>
          </Box>
          <Box variant="h4">{title}</Box>
          <Box color="text-body-secondary" fontSize="body-s">
            {description}
          </Box>
        </SpaceBetween>
      </Container>
    </div>
  );
}

// Code block component for displaying code snippets
function CodeBlock({ code, language }: { code: string; language: string }) {
  return (
    <div style={{ position: 'relative' }}>
      <Box variant="code">
        <pre style={{
          backgroundColor: '#1a1a2e',
          color: '#e0e0e0',
          padding: '16px',
          borderRadius: '8px',
          overflow: 'auto',
          fontSize: '13px',
          lineHeight: '1.5',
          margin: 0,
        }}>
          <code>{code}</code>
        </pre>
      </Box>
      <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
        <CopyToClipboard
          copyButtonAriaLabel={`Copy ${language} code`}
          copyErrorText="Failed to copy"
          copySuccessText="Copied!"
          textToCopy={code}
          variant="icon"
        />
      </div>
    </div>
  );
}

interface ConnectionsTabProps {
  databaseName: string;
  endpoint?: string;
  region?: string;
  onSelectQueriesTab?: () => void;
}

type ModalType = 'codeSnippet' | 'cloudShell' | 'endpoints' | null;

export default function ConnectionsTab({ databaseName, endpoint, region, onSelectQueriesTab }: ConnectionsTabProps) {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const displayEndpoint = endpoint || `${databaseName}.dsql.${region || 'us-east-1'}.on.aws`;
  const displayRegion = region || 'us-east-1';

  // Code snippets for different languages
  const pythonCode = `import psycopg2
import boto3

# Generate authentication token
client = boto3.client('dsql', region_name='${displayRegion}')
token = client.generate_db_connect_auth_token(
    hostname='${displayEndpoint}',
    region='${displayRegion}'
)

# Connect to the database
conn = psycopg2.connect(
    host='${displayEndpoint}',
    port=5432,
    user='admin',
    password=token,
    database='postgres',
    sslmode='require'
)

# Execute a query
cursor = conn.cursor()
cursor.execute('SELECT version()')
print(cursor.fetchone())

conn.close()`;

  const nodeCode = `const { Client } = require('pg');
const { DSQLClient, GenerateDBConnectAuthTokenCommand } = require('@aws-sdk/client-dsql');

async function connect() {
  // Generate authentication token
  const dsqlClient = new DSQLClient({ region: '${displayRegion}' });
  const command = new GenerateDBConnectAuthTokenCommand({
    hostname: '${displayEndpoint}',
    region: '${displayRegion}'
  });
  const token = await dsqlClient.send(command);

  // Connect to the database
  const client = new Client({
    host: '${displayEndpoint}',
    port: 5432,
    user: 'admin',
    password: token.authToken,
    database: 'postgres',
    ssl: { rejectUnauthorized: true }
  });

  await client.connect();

  // Execute a query
  const result = await client.query('SELECT version()');
  console.log(result.rows[0]);

  await client.end();
}

connect();`;

  const javaCode = `import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import software.amazon.awssdk.services.dsql.DsqlClient;
import software.amazon.awssdk.services.dsql.model.GenerateDbConnectAuthTokenRequest;

public class DSQLConnection {
    public static void main(String[] args) throws Exception {
        // Generate authentication token
        DsqlClient dsqlClient = DsqlClient.builder()
            .region(Region.of("${displayRegion}"))
            .build();

        String token = dsqlClient.generateDbConnectAuthToken(
            GenerateDbConnectAuthTokenRequest.builder()
                .hostname("${displayEndpoint}")
                .region("${displayRegion}")
                .build()
        ).authToken();

        // Connect to the database
        String url = "jdbc:postgresql://${displayEndpoint}:5432/postgres?sslmode=require";
        Connection conn = DriverManager.getConnection(url, "admin", token);

        // Execute a query
        Statement stmt = conn.createStatement();
        ResultSet rs = stmt.executeQuery("SELECT version()");
        while (rs.next()) {
            System.out.println(rs.getString(1));
        }

        conn.close();
    }
}`;

  const cloudShellCommands = [
    {
      title: 'Generate authentication token',
      command: `aws dsql generate-db-connect-auth-token \\
  --hostname ${displayEndpoint} \\
  --region ${displayRegion}`,
    },
    {
      title: 'Connect using psql',
      command: `PGPASSWORD=$(aws dsql generate-db-connect-auth-token --hostname ${displayEndpoint} --region ${displayRegion} --query authToken --output text) \\
psql "host=${displayEndpoint} port=5432 user=admin dbname=postgres sslmode=require"`,
    },
    {
      title: 'List databases',
      command: `PGPASSWORD=$(aws dsql generate-db-connect-auth-token --hostname ${displayEndpoint} --region ${displayRegion} --query authToken --output text) \\
psql "host=${displayEndpoint} port=5432 user=admin dbname=postgres sslmode=require" -c "\\l"`,
    },
  ];

  const handleCodeSnippet = () => {
    setActiveModal('codeSnippet');
  };

  const handleCloudShell = () => {
    setActiveModal('cloudShell');
  };

  const handleEndpoints = () => {
    setActiveModal('endpoints');
  };

  const handleQueryEditor = () => {
    if (onSelectQueriesTab) {
      onSelectQueriesTab();
    }
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <>
      <SpaceBetween size="l">
        <Header variant="h2" description="Choose a connection method to see the instructions.">
          Connect Your Database
        </Header>

        <Grid
          gridDefinition={[
            { colspan: { default: 12, s: 3 } },
            { colspan: { default: 12, s: 3 } },
            { colspan: { default: 12, s: 3 } },
            { colspan: { default: 12, s: 3 } },
          ]}
        >
          <ConnectionMethodCard
            icon={<span style={{ fontFamily: 'monospace', fontSize: '1.5rem' }}>&lt;/&gt;</span>}
            iconColor="#ff9900"
            title="Code Snippet"
            description="SDK, APIs, or third-party tools"
            onClick={handleCodeSnippet}
          />
          <ConnectionMethodCard
            icon={<span style={{ fontFamily: 'monospace', fontSize: '1.5rem' }}>&gt;_</span>}
            iconColor="#ff9900"
            title="CloudShell"
            description="Quick access to AWS CLI"
            onClick={handleCloudShell}
          />
          <ConnectionMethodCard
            icon={<Icon name="status-pending" size="big" />}
            iconColor="#d91515"
            title="Endpoints"
            description="Connection endpoints"
            onClick={handleEndpoints}
          />
          <ConnectionMethodCard
            icon={<Icon name="search" size="big" />}
            iconColor="#7b5bf5"
            title="Query editor"
            description="In-console SQL editor"
            onClick={handleQueryEditor}
          />
        </Grid>
      </SpaceBetween>

      {/* Code Snippet Modal */}
      <Modal
        visible={activeModal === 'codeSnippet'}
        onDismiss={closeModal}
        header="Connect with code"
        size="large"
        footer={
          <Box float="right">
            <Button variant="primary" onClick={closeModal}>Close</Button>
          </Box>
        }
      >
        <SpaceBetween size="l">
          <Box>
            Use the following code snippets to connect to <strong>{databaseName}</strong> from your application.
          </Box>
          <Tabs
            tabs={[
              {
                label: "Python",
                id: "python",
                content: (
                  <SpaceBetween size="m">
                    <Box color="text-body-secondary">
                      Install required packages: <code>pip install psycopg2-binary boto3</code>
                    </Box>
                    <CodeBlock code={pythonCode} language="Python" />
                  </SpaceBetween>
                ),
              },
              {
                label: "Node.js",
                id: "nodejs",
                content: (
                  <SpaceBetween size="m">
                    <Box color="text-body-secondary">
                      Install required packages: <code>npm install pg @aws-sdk/client-dsql</code>
                    </Box>
                    <CodeBlock code={nodeCode} language="Node.js" />
                  </SpaceBetween>
                ),
              },
              {
                label: "Java",
                id: "java",
                content: (
                  <SpaceBetween size="m">
                    <Box color="text-body-secondary">
                      Add the AWS SDK for Java and PostgreSQL JDBC driver to your project dependencies.
                    </Box>
                    <CodeBlock code={javaCode} language="Java" />
                  </SpaceBetween>
                ),
              },
            ]}
          />
        </SpaceBetween>
      </Modal>

      {/* CloudShell Modal */}
      <Modal
        visible={activeModal === 'cloudShell'}
        onDismiss={closeModal}
        header="Connect with CloudShell"
        size="large"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button
                variant="link"
                href="https://console.aws.amazon.com/cloudshell"
                target="_blank"
                iconAlign="right"
                iconName="external"
              >
                Open CloudShell
              </Button>
              <Button variant="primary" onClick={closeModal}>Close</Button>
            </SpaceBetween>
          </Box>
        }
      >
        <SpaceBetween size="l">
          <Box>
            Use AWS CloudShell to quickly connect to <strong>{databaseName}</strong> using the AWS CLI and psql.
          </Box>
          {cloudShellCommands.map((cmd, index) => (
            <Container key={index} header={<Header variant="h3">{`${index + 1}. ${cmd.title}`}</Header>}>
              <CodeBlock code={cmd.command} language="bash" />
            </Container>
          ))}
        </SpaceBetween>
      </Modal>

      {/* Endpoints Modal */}
      <Modal
        visible={activeModal === 'endpoints'}
        onDismiss={closeModal}
        header="Database Endpoints"
        size="medium"
        footer={
          <Box float="right">
            <Button variant="primary" onClick={closeModal}>Close</Button>
          </Box>
        }
      >
        <SpaceBetween size="l">
          <Box>
            Use these endpoints to connect to <strong>{databaseName}</strong>.
          </Box>
          <Container header={<Header variant="h3">Connection details</Header>}>
            <ColumnLayout columns={1} variant="text-grid">
              <div>
                <Box color="text-body-secondary" fontSize="body-s">Cluster endpoint</Box>
                <CopyToClipboard
                  copyButtonAriaLabel="Copy endpoint"
                  copyErrorText="Failed to copy"
                  copySuccessText="Endpoint copied"
                  textToCopy={displayEndpoint}
                  variant="inline"
                />
              </div>
              <div>
                <Box color="text-body-secondary" fontSize="body-s">Port</Box>
                <CopyToClipboard
                  copyButtonAriaLabel="Copy port"
                  copyErrorText="Failed to copy"
                  copySuccessText="Port copied"
                  textToCopy="5432"
                  variant="inline"
                />
              </div>
              <div>
                <Box color="text-body-secondary" fontSize="body-s">Database name</Box>
                <CopyToClipboard
                  copyButtonAriaLabel="Copy database name"
                  copyErrorText="Failed to copy"
                  copySuccessText="Database name copied"
                  textToCopy="postgres"
                  variant="inline"
                />
              </div>
              <div>
                <Box color="text-body-secondary" fontSize="body-s">Username</Box>
                <CopyToClipboard
                  copyButtonAriaLabel="Copy username"
                  copyErrorText="Failed to copy"
                  copySuccessText="Username copied"
                  textToCopy="admin"
                  variant="inline"
                />
              </div>
              <div>
                <Box color="text-body-secondary" fontSize="body-s">Region</Box>
                <CopyToClipboard
                  copyButtonAriaLabel="Copy region"
                  copyErrorText="Failed to copy"
                  copySuccessText="Region copied"
                  textToCopy={displayRegion}
                  variant="inline"
                />
              </div>
              <div>
                <Box color="text-body-secondary" fontSize="body-s">SSL Mode</Box>
                <Box>Required (sslmode=require)</Box>
              </div>
            </ColumnLayout>
          </Container>
          <Box color="text-body-secondary" fontSize="body-s">
            <Icon name="status-info" /> Authentication is handled via IAM. Generate an auth token using the AWS SDK or CLI.
          </Box>
        </SpaceBetween>
      </Modal>
    </>
  );
}
