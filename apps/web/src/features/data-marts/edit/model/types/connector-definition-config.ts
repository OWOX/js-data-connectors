export interface ConnectorSourceConfig {
  name: string;
  configuration: Record<string, unknown>[];
  node: string;
  fields: string[];
}

export interface ConnectorStorageConfig {
  type: string;
  athena?: {
    databaseName: string;
    outputLocation: string;
  };
  bigquery?: {
    datasetId: string;
  };
}

export interface ConnectorConfig {
  source: ConnectorSourceConfig;
  storage: ConnectorStorageConfig;
}

export interface ConnectorDefinitionConfig {
  connector: ConnectorConfig;
}
