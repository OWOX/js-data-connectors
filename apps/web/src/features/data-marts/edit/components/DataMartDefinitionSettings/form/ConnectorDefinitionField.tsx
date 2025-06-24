import { useFormContext, type Control } from 'react-hook-form';
import { type DataMartDefinitionFormData } from '../../../model/schema/data-mart-definition.schema.ts';
import { FormControl, FormField, FormItem, FormMessage } from '@owox/ui/components/form';
import { Button } from '@owox/ui/components/button';
import { DataStorageType } from '../../../../../data-storage';
import { DataMartConnectorView } from '../../DataMartConnectorView.tsx';
import { ArrowRight, Database, Trash2, Plus } from 'lucide-react';
import {
  type ConnectorDefinitionConfig,
  type ConnectorConfig,
  type ConnectorSourceConfig,
  type ConnectorStorageConfig,
} from '../../../model/types/connector-definition-config.ts';

interface ConnectorDefinitionFieldProps {
  control: Control<DataMartDefinitionFormData>;
  storageType: DataStorageType;
}

export function ConnectorDefinitionField({ control, storageType }: ConnectorDefinitionFieldProps) {
  const { setValue, getValues, trigger } = useFormContext<DataMartDefinitionFormData>();

  const triggerValidation = () => {
    setTimeout(() => void trigger('definition'), 0);
  };

  const getStorageDisplayName = (type: DataStorageType) => {
    switch (type) {
      case DataStorageType.GOOGLE_BIGQUERY:
        return 'Google BigQuery';
      case DataStorageType.AWS_ATHENA:
        return 'AWS Athena';
      default:
        return type;
    }
  };

  const getStorageDetails = (storage: ConnectorStorageConfig) => {
    switch (storage.type) {
      case 'GOOGLE_BIGQUERY':
        if (storage.bigquery?.datasetId) {
          return `Dataset: ${storage.bigquery.datasetId}`;
        }
        return 'Dataset not configured';
      case 'AWS_ATHENA': {
        const details = [];
        if (storage.athena?.databaseName) {
          details.push(`Database: ${storage.athena.databaseName}`);
        }
        if (storage.athena?.outputLocation) {
          details.push(`Output: ${storage.athena.outputLocation}`);
        }
        return details.length > 0 ? details.join(', ') : 'Database and output not configured';
      }
      default:
        return 'Not configured';
    }
  };

  const isConnectorDefinition = (value: unknown): value is ConnectorDefinitionConfig => {
    return Boolean(value && typeof value === 'object' && 'connector' in value);
  };

  const isConnectorConfigured = (value: unknown): boolean => {
    if (!isConnectorDefinition(value)) {
      return false;
    }

    const { source, storage } = value.connector;

    const hasValidSource =
      Boolean(source.name) &&
      Boolean(source.configuration) &&
      source.configuration.length > 0 &&
      Boolean(source.node) &&
      Boolean(source.fields) &&
      source.fields.length > 0;

    const hasValidStorage =
      Boolean(storage.type) &&
      (!storage.athena ||
        (Boolean(storage.athena.databaseName) && Boolean(storage.athena.outputLocation))) &&
      (!storage.bigquery || Boolean(storage.bigquery.datasetId));

    return hasValidSource && hasValidStorage;
  };

  const adaptConnectorToSource = (connector: ConnectorConfig): ConnectorSourceConfig => {
    if ('source' in connector) {
      return connector.source;
    }
    const legacyConnector = connector as unknown as {
      name?: string;
      configuration?: Record<string, unknown>;
      nodes?: string[];
      fields?: string[];
    };

    return {
      name: legacyConnector.name ?? 'Unknown Connector',
      configuration: legacyConnector.configuration ? [legacyConnector.configuration] : [{}],
      node: legacyConnector.nodes?.[0] ?? 'default',
      fields:
        legacyConnector.fields && legacyConnector.fields.length > 0
          ? legacyConnector.fields
          : ['*'],
    };
  };

  const setupConnector = (connector: ConnectorConfig) => {
    const source: ConnectorSourceConfig = adaptConnectorToSource(connector);

    const hasValidStorageConfig =
      connector.storage.athena?.databaseName ??
      connector.storage.athena?.outputLocation ??
      connector.storage.bigquery?.datasetId;

    const storage: ConnectorStorageConfig = hasValidStorageConfig
      ? connector.storage
      : { type: storageType };

    const newDefinition: ConnectorDefinitionConfig = {
      connector: {
        source,
        storage,
      },
    };
    setValue('definition', newDefinition, { shouldDirty: true, shouldTouch: true });
    triggerValidation();
  };

  const updateConnectorSource = (connector: ConnectorConfig) => {
    const updatedSource: ConnectorSourceConfig = adaptConnectorToSource(connector);
    const currentValues = getValues();
    const currentDefinition = currentValues.definition;

    if (isConnectorDefinition(currentDefinition)) {
      const updatedDefinition: ConnectorDefinitionConfig = {
        connector: {
          ...currentDefinition.connector,
          source: updatedSource,
        },
      };
      setValue('definition', updatedDefinition, { shouldDirty: true, shouldTouch: true });
      triggerValidation();
    }
  };

  const removeConfiguration = (configIndex: number) => {
    const currentValues = getValues();
    const currentDefinition = currentValues.definition;

    if (
      isConnectorDefinition(currentDefinition) &&
      currentDefinition.connector.source.configuration.length > 1
    ) {
      const updatedSource: ConnectorSourceConfig = {
        ...currentDefinition.connector.source,
        configuration: currentDefinition.connector.source.configuration.filter(
          (_, index) => index !== configIndex
        ),
      };

      const updatedDefinition: ConnectorDefinitionConfig = {
        connector: {
          ...currentDefinition.connector,
          source: updatedSource,
        },
      };
      setValue('definition', updatedDefinition, { shouldDirty: true, shouldTouch: true });
      triggerValidation();
    }
  };

  const addConfiguration = (newConfig: Record<string, unknown>) => {
    const currentValues = getValues();
    const currentDefinition = currentValues.definition;

    if (isConnectorDefinition(currentDefinition)) {
      const updatedSource: ConnectorSourceConfig = {
        ...currentDefinition.connector.source,
        configuration: [...currentDefinition.connector.source.configuration, newConfig],
      };

      const updatedDefinition: ConnectorDefinitionConfig = {
        connector: {
          ...currentDefinition.connector,
          source: updatedSource,
        },
      };
      setValue('definition', updatedDefinition, { shouldDirty: true, shouldTouch: true });
      triggerValidation();
    }
  };

  return (
    <FormField
      control={control}
      name='definition'
      render={({ field }) => (
        <FormItem className='space-y-0'>
          <FormControl>
            <div className='space-y-4'>
              {!isConnectorConfigured(field.value) ? (
                <div className='space-y-4'>
                  <div className='text-muted-foreground text-sm font-medium'>Input Source</div>
                  <DataMartConnectorView
                    dataStorageType={storageType}
                    onSubmit={setupConnector}
                    configurationOnly={false}
                  >
                    <Button
                      type='button'
                      variant='outline'
                      className='hover:border-primary/50 flex h-24 w-full items-center justify-center gap-2 border-2 border-dashed'
                    >
                      <Database className='h-6 w-6' />
                      <span>Setup Connector</span>
                    </Button>
                  </DataMartConnectorView>
                </div>
              ) : (
                <div className='space-y-4'>
                  <div className='text-muted-foreground text-sm font-medium'>Input Source</div>

                  <div className='space-y-3'>
                    {isConnectorConfigured(field.value)
                      ? (
                          field.value as ConnectorDefinitionConfig
                        ).connector.source.configuration.map(
                          (_: Record<string, unknown>, configIndex: number) => {
                            const connectorDef = field.value as ConnectorDefinitionConfig;
                            return (
                              <div
                                key={configIndex}
                                className='space-y-3 rounded-lg border bg-gray-50 p-4'
                              >
                                <div className='flex items-center justify-between'>
                                  <div className='text-sm font-medium text-gray-700'>
                                    Configuration {configIndex + 1}
                                  </div>
                                  <Button
                                    type='button'
                                    variant='ghost'
                                    size='sm'
                                    onClick={() => {
                                      removeConfiguration(configIndex);
                                    }}
                                    disabled={
                                      connectorDef.connector.source.configuration.length <= 1
                                    }
                                    className='text-red-600 hover:bg-red-50 hover:text-red-700 disabled:text-gray-400'
                                  >
                                    <Trash2 className='h-4 w-4' />
                                  </Button>
                                </div>

                                <div className='grid grid-cols-2 gap-4'>
                                  <DataMartConnectorView
                                    dataStorageType={storageType}
                                    onSubmit={updateConnectorSource}
                                    configurationOnly={false}
                                  >
                                    <div className='hover:border-primary/50 min-h-[80px] rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-colors'>
                                      <div className='flex items-center justify-between'>
                                        <div className='flex min-w-0 flex-1 flex-col'>
                                          <div className='truncate font-medium text-gray-900'>
                                            {connectorDef.connector.source.name || 'Connector'}
                                          </div>
                                          <div className='mt-1 truncate text-sm text-gray-500'>
                                            {connectorDef.connector.source.node ||
                                              'No node selected'}
                                          </div>
                                        </div>
                                        <div className='ml-4 flex items-center gap-2'>
                                          <div className='text-sm font-medium text-gray-700'>
                                            {connectorDef.connector.source.fields.length.toString()}
                                          </div>
                                          <div className='text-xs text-gray-500'>fields</div>
                                          <ArrowRight className='ml-2 h-4 w-4 text-gray-400' />
                                        </div>
                                      </div>
                                    </div>
                                  </DataMartConnectorView>

                                  <div className='min-h-[80px] rounded-lg border border-gray-200 bg-white p-4 shadow-sm'>
                                    <div className='flex h-full flex-col justify-center'>
                                      <div className='font-medium text-gray-900'>
                                        {getStorageDisplayName(storageType)}
                                      </div>
                                      <div className='mt-1 text-sm text-gray-500'>
                                        {getStorageDetails(connectorDef.connector.storage)}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                        )
                      : null}

                    <div className='border-t pt-4'>
                      <DataMartConnectorView
                        dataStorageType={storageType}
                        onSubmit={connector => {
                          const newConfig = connector.source.configuration[0] || {};
                          addConfiguration(newConfig);
                        }}
                        configurationOnly={true}
                      >
                        <Button
                          type='button'
                          variant='outline'
                          className='hover:border-primary/50 flex h-12 w-full items-center justify-center gap-2 border-2 border-dashed text-sm'
                        >
                          <Plus className='h-4 w-4' />
                          <span>Add more configuration</span>
                        </Button>
                      </DataMartConnectorView>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
