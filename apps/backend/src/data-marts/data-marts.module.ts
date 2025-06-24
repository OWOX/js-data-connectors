import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { DataMartController } from './controllers/data-mart.controller';
import { DataStorageController } from './controllers/data-storage.controller';
import { CreateDataMartService } from './use-cases/create-data-mart.service';
import { ListDataMartsService } from './use-cases/list-data-marts.service';
import { GetDataMartService } from './use-cases/get-data-mart.service';
import { DataMartMapper } from './mappers/data-mart.mapper';
import { DataStorageService } from './services/data-storage.service';
import { DataStorageMapper } from './mappers/data-storage.mapper';
import { GetDataStorageService } from './use-cases/get-data-storage.service';
import { CreateDataStorageService } from './use-cases/create-data-storage.service';
import { UpdateDataStorageService } from './use-cases/update-data-storage.service';
import { DataMart } from './entities/data-mart.entity';
import { DataStorage } from './entities/data-storage.entity';
import { DataMartRun } from './entities/data-mart-run.entity';
import { dataStorageFacadesProviders } from './data-storage-types/data-storage-facades';
import { dataStorageResolverProviders } from './data-storage-types/data-storage-providers';
import { UpdateDataMartDefinitionService } from './use-cases/update-data-mart-definition.service';
import { DataMartService } from './services/data-mart.service';
import { PublishDataMartService } from './use-cases/publish-data-mart.service';
import { UpdateDataMartDescriptionService } from './use-cases/update-data-mart-description.service';
import { UpdateDataMartTitleService } from './use-cases/update-data-mart-title.service';
import { ListDataStoragesService } from './use-cases/list-data-storages.service';
import { DeleteDataStorageService } from './use-cases/delete-data-storage.service';
import { DeleteDataMartService } from './use-cases/delete-data-mart.service';
import { ConnectorController } from './controllers/connector.controller';
import { AvailableConnectorService } from './use-cases/connector/available-connector.service';
import { ConnectorService } from './services/connector.service';
import { ConnectorMapper } from './mappers/connector.mapper';
import { SpecificationConnectorService } from './use-cases/connector/specification-connector.service';
import { FieldsConnectorService } from './use-cases/connector/fields-connector.service';
import { RunDataMartService } from './use-cases/run-data-mart.service';

@Module({
  imports: [TypeOrmModule.forFeature([DataMart, DataStorage, DataMartRun])],
  controllers: [DataMartController, DataStorageController, ConnectorController],
  providers: [
    ...dataStorageResolverProviders,
    ...dataStorageFacadesProviders,
    DataMartService,
    CreateDataMartService,
    ListDataMartsService,
    GetDataMartService,
    UpdateDataMartDefinitionService,
    PublishDataMartService,
    UpdateDataMartDescriptionService,
    UpdateDataMartTitleService,
    DataMartMapper,
    DataStorageService,
    DataStorageMapper,
    ListDataStoragesService,
    DeleteDataStorageService,
    DeleteDataMartService,
    GetDataStorageService,
    CreateDataStorageService,
    UpdateDataStorageService,
    AvailableConnectorService,
    ConnectorService,
    ConnectorMapper,
    SpecificationConnectorService,
    FieldsConnectorService,
    RunDataMartService,
  ],
})
export class DataMartsModule {}
