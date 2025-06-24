import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// @ts-expect-error - Package lacks TypeScript declarations
import { AvailableConnectors, Connectors, Core } from '@owox/connectors';
import { ConnectorRunner, RunConfig, StorageConfig, SourceConfig } from '@owox/connector-runner';
import { ConnectorDefinition } from '../connector-types/connector-definition';
import { ConnectorDefinition as DataMartConnectorDefinition } from '../dto/schemas/data-mart-table-definitions/connector-definition.schema';
import { ConnectorSpecification } from '../connector-types/connector-specification';
import { ConnectorFieldsSchema } from '../connector-types/connector-fields-schema';
import { DataMart } from '../entities/data-mart.entity';
import { DataMartRun } from '../entities/data-mart-run.entity';
import { DataMartDefinitionType } from '../enums/data-mart-definition-type.enum';
import { DataMartRunStatus } from '../enums/data-mart-run-status.enum';

@Injectable()
export class ConnectorService {
  private readonly logger = new Logger(ConnectorService.name);

  constructor(
    @InjectRepository(DataMartRun)
    private readonly dataMartRunRepository: Repository<DataMartRun>
  ) {}

  async getAvailableConnectors(): Promise<ConnectorDefinition[]> {
    return AvailableConnectors.map(connector => ({
      name: connector,
      title: connector,
      description: null,
      icon: null,
    }));
  }

  async getConnectorSpecification(connectorName: string): Promise<ConnectorSpecification> {
    if (Object.keys(Connectors).length === 0) {
      throw new Error('No connectors found');
    }
    if (!Object.keys(Connectors).includes(connectorName)) {
      throw new Error(`Connector ${connectorName} not found`);
    }
    const source = Connectors[connectorName][`${connectorName}Source`];
    const newSource = new source(new Core.AbstractConfig({}));
    const configSchema = Object.keys(newSource.config).map(key => {
      return {
        name: key,
        title: newSource.config[key].displayName,
        description: newSource.config[key].description,
        default: newSource.config[key].default,
        requiredType: newSource.config[key].requiredType,
        required: newSource.config[key].isRequired,
        options: newSource.config[key].options,
        placeholder: newSource.config[key].placeholder,
      };
    });
    return ConnectorSpecification.parse(configSchema);
  }

  async getConnectorFieldsSchema(connectorName: string): Promise<ConnectorFieldsSchema> {
    if (Object.keys(Connectors).length === 0) {
      throw new Error('No connectors found');
    }
    if (!Object.keys(Connectors).includes(connectorName)) {
      throw new Error(`Connector ${connectorName} not found`);
    }
    const source = Connectors[connectorName][`${connectorName}Source`];
    const sourceInstance = new source(new Core.AbstractConfig({}));
    const sourceFieldsSchema = sourceInstance.getFieldsSchema();
    const fieldsSchema = Object.keys(sourceFieldsSchema).map(key => {
      return {
        name: key,
        overview: sourceFieldsSchema[key].overview,
        description: sourceFieldsSchema[key].description,
        documentation: sourceFieldsSchema[key].documentation,
        fields: Object.keys(sourceFieldsSchema[key].fields).map(fieldKey => ({
          name: fieldKey,
          type: sourceFieldsSchema[key].fields[fieldKey].type,
          description: sourceFieldsSchema[key].fields[fieldKey].description,
        })),
      };
    });
    return ConnectorFieldsSchema.parse(fieldsSchema);
  }

  private createLogCaptureConfig(
    dataMartId: string,
    capturedErrors: string[],
    capturedLogs: string[]
  ) {
    return {
      logCapture: {
        onStdout: (message: string) => {
          const logMessage = `${message.trim()}`;
          capturedLogs.push(logMessage);
          this.logger.log(`[${dataMartId}]: ${logMessage}`);
        },
        onStderr: (message: string) => {
          const errorMessage = `${message.trim()}`;
          capturedErrors.push(errorMessage);
          this.logger.error(`[${dataMartId}]: ${errorMessage}`);
        },
        passThrough: false,
      },
    };
  }

  async run(dataMart: DataMart): Promise<string> {
    if (dataMart.definitionType !== DataMartDefinitionType.CONNECTOR) {
      throw new Error('DataMart is not a connector');
    }

    const dataMartRun = this.dataMartRunRepository.create({
      dataMartId: dataMart.id,
      definitionRun: dataMart.definition,
      status: DataMartRunStatus.RUNNING,
      logs: [],
      errors: [],
    });

    const savedRun = await this.dataMartRunRepository.save(dataMartRun);

    this.runInBackground(dataMart, savedRun.id).catch(error => {
      this.logger.error(`Background execution failed for run ${savedRun.id}:`, error);
    });

    return savedRun.id;
  }

  async getRunStatus(runId: string): Promise<DataMartRun | null> {
    return await this.dataMartRunRepository.findOne({
      where: { id: runId },
      relations: ['dataMart'],
    });
  }

  async getDataMartRuns(dataMartId: string): Promise<DataMartRun[]> {
    return await this.dataMartRunRepository.find({
      where: { dataMartId },
      order: { createdAt: 'DESC' },
    });
  }

  private async runInBackground(dataMart: DataMart, runId: string): Promise<void> {
    const capturedLogs: string[] = [];
    const capturedErrors: string[] = [];

    const logCaptureConfig = this.createLogCaptureConfig(dataMart.id, capturedErrors, capturedLogs);

    const definition = dataMart.definition as DataMartConnectorDefinition;
    const connector = definition.connector;

    try {
      for (const config of connector.source.configuration) {
        const runConfig = new RunConfig({
          name: connector.source.name,
          datamartId: dataMart.id,
          source: new SourceConfig({
            name: connector.source.name,
            config: config,
          }),
          storage: new StorageConfig({
            name: connector.storage.type,
            config: connector.storage,
          }),
        });

        const connectorRunner = new ConnectorRunner();

        await connectorRunner.run(dataMart.id, dataMart.id, runConfig, logCaptureConfig);
      }

      if (capturedErrors.length > 0) {
        await this.dataMartRunRepository.update(runId, {
          status: DataMartRunStatus.FAILED,
          logs: capturedLogs,
          errors: capturedErrors,
        });
      } else {
        await this.dataMartRunRepository.update(runId, {
          status: DataMartRunStatus.SUCCESS,
          logs: capturedLogs,
          errors: capturedErrors,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      capturedErrors.push(errorMessage);

      await this.dataMartRunRepository.update(runId, {
        status: DataMartRunStatus.FAILED,
        logs: capturedLogs,
        errors: capturedErrors,
      });

      this.logger.error(`Connector execution failed for DataMart ${dataMart.id}:`, error);
    }
  }
}
