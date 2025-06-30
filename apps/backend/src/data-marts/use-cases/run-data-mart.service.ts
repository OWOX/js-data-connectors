import { Injectable } from '@nestjs/common';
import { DataMartService } from '../services/data-mart.service';
import { DataMartDefinitionType } from '../enums/data-mart-definition-type.enum';
import { ConnectorService } from '../services/connector.service';

@Injectable()
export class RunDataMartService {
  constructor(
    private readonly dataMartService: DataMartService,
    private readonly connectorService: ConnectorService
  ) {}

  async run(dataMartId: string, projectId: string, userId: string): Promise<string> {
    const dataMart = await this.dataMartService.getByIdAndProjectIdAndUserId(
      dataMartId,
      projectId,
      userId
    );

    if (dataMart.definitionType !== DataMartDefinitionType.CONNECTOR) {
      throw new Error('Data mart is not a connector');
    }

    const runId = await this.connectorService.run(dataMart);
    return runId;
  }
}
