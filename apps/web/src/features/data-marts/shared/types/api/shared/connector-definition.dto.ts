export interface ConnectorSourceDto {
  name: string;
  configuration: Record<string, unknown>[];
  node: string;
  fields: string[];
}

export interface ConnectorStorageDto {
  type: string;
  athena?: {
    databaseName: string;
    outputLocation: string;
  };
  bigquery?: {
    datasetId: string;
  };
}

export interface ConnectorDto {
  source: ConnectorSourceDto;
  storage: ConnectorStorageDto;
}

export interface ConnectorDefinitionDto {
  connector: ConnectorDto;
}
