import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { CreateDataMartRequestApiDto } from '../dto/presentation/create-data-mart-request-api.dto';
import { CreateDataMartResponseApiDto } from '../dto/presentation/create-data-mart-response-api.dto';
import { DataMartResponseApiDto } from '../dto/presentation/data-mart-response-api.dto';
import { UpdateDataMartDefinitionApiDto } from '../dto/presentation/update-data-mart-definition-api.dto';
import { UpdateDataMartTitleApiDto } from '../dto/presentation/update-data-mart-title-api.dto';
import { UpdateDataMartDescriptionApiDto } from '../dto/presentation/update-data-mart-description-api.dto';

import { DataMartMapper } from '../mappers/data-mart.mapper';
import { ListDataMartsService } from '../use-cases/list-data-marts.service';
import { GetDataMartService } from '../use-cases/get-data-mart.service';
import { CreateDataMartService } from '../use-cases/create-data-mart.service';
import { UpdateDataMartDefinitionService } from '../use-cases/update-data-mart-definition.service';
import { UpdateDataMartTitleService } from '../use-cases/update-data-mart-title.service';
import { UpdateDataMartDescriptionService } from '../use-cases/update-data-mart-description.service';
import { PublishDataMartService } from '../use-cases/publish-data-mart.service';
import { DeleteDataMartService } from '../use-cases/delete-data-mart.service';
import { ApiTags } from '@nestjs/swagger';
import {
  CreateDataMartSpec,
  GetDataMartSpec,
  ListDataMartsSpec,
  PublishDataMartSpec,
  UpdateDataMartDefinitionSpec,
  UpdateDataMartDescriptionSpec,
  UpdateDataMartTitleSpec,
  DeleteDataMartSpec,
} from './spec/data-mart.api';
import {
  AuthContext,
  AuthorizationContext,
} from '../../common/authorization-context/authorization.context';

@Controller('data-marts')
@ApiTags('DataMarts')
export class DataMartController {
  constructor(
    private readonly createDataMartService: CreateDataMartService,
    private readonly listDataMartsService: ListDataMartsService,
    private readonly getDataMartService: GetDataMartService,
    private readonly updateDefinitionService: UpdateDataMartDefinitionService,
    private readonly updateTitleService: UpdateDataMartTitleService,
    private readonly updateDescriptionService: UpdateDataMartDescriptionService,
    private readonly publishDataMartService: PublishDataMartService,
    private readonly deleteDataMartService: DeleteDataMartService,
    private readonly mapper: DataMartMapper
  ) {}

  @Post()
  @CreateDataMartSpec()
  async create(
    @AuthContext() context: AuthorizationContext,
    @Body() dto: CreateDataMartRequestApiDto
  ): Promise<CreateDataMartResponseApiDto> {
    const command = this.mapper.toCreateDomainCommand(context, dto);
    const dataMart = await this.createDataMartService.run(command);
    return this.mapper.toCreateResponse(dataMart);
  }

  @Get()
  @ListDataMartsSpec()
  async list(@AuthContext() context: AuthorizationContext): Promise<DataMartResponseApiDto[]> {
    const command = this.mapper.toListCommand(context);
    const dataMarts = await this.listDataMartsService.run(command);
    return this.mapper.toResponseList(dataMarts);
  }

  @Get(':id')
  @GetDataMartSpec()
  async get(
    @AuthContext() context: AuthorizationContext,
    @Param('id') id: string
  ): Promise<DataMartResponseApiDto> {
    const command = this.mapper.toGetCommand(id, context);
    const dataMart = await this.getDataMartService.run(command);
    return this.mapper.toResponse(dataMart);
  }

  @Put(':id/definition')
  @UpdateDataMartDefinitionSpec()
  async updateDefinition(
    @AuthContext() context: AuthorizationContext,
    @Param('id') id: string,
    @Body() dto: UpdateDataMartDefinitionApiDto
  ): Promise<DataMartResponseApiDto> {
    const command = this.mapper.toUpdateDefinitionCommand(id, context, dto);
    const dataMart = await this.updateDefinitionService.run(command);
    return this.mapper.toResponse(dataMart);
  }

  @Put(':id/title')
  @UpdateDataMartTitleSpec()
  async updateTitle(
    @AuthContext() context: AuthorizationContext,
    @Param('id') id: string,
    @Body() dto: UpdateDataMartTitleApiDto
  ): Promise<DataMartResponseApiDto> {
    const command = this.mapper.toUpdateTitleCommand(id, context, dto);
    const dataMart = await this.updateTitleService.run(command);
    return this.mapper.toResponse(dataMart);
  }

  @Put(':id/description')
  @UpdateDataMartDescriptionSpec()
  async updateDescription(
    @AuthContext() context: AuthorizationContext,
    @Param('id') id: string,
    @Body() dto: UpdateDataMartDescriptionApiDto
  ): Promise<DataMartResponseApiDto> {
    const command = this.mapper.toUpdateDescriptionCommand(id, context, dto);
    const dataMart = await this.updateDescriptionService.run(command);
    return this.mapper.toResponse(dataMart);
  }

  @Put(':id/publish')
  @PublishDataMartSpec()
  async publish(
    @AuthContext() context: AuthorizationContext,
    @Param('id') id: string
  ): Promise<DataMartResponseApiDto> {
    const command = this.mapper.toPublishCommand(id, context);
    const dataMart = await this.publishDataMartService.run(command);
    return this.mapper.toResponse(dataMart);
  }

  @Delete(':id')
  @DeleteDataMartSpec()
  async delete(
    @AuthContext() context: AuthorizationContext,
    @Param('id') id: string
  ): Promise<void> {
    const command = this.mapper.toDeleteCommand(id, context);
    await this.deleteDataMartService.run(command);
  }
}
