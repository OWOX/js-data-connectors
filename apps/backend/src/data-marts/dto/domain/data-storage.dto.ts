import { DataStorageType } from '../../data-storage-types/enums/data-storage-type.enum';
import { DataStorageConfig } from '../../data-storage-types/data-storage-config.type';

export class DataStorageDto {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly type: DataStorageType,
    public readonly projectId: string,
    public readonly credentials: Record<string, unknown> | undefined,
    public readonly config: DataStorageConfig | undefined,
    public readonly createdAt: Date,
    public readonly modifiedAt: Date
  ) {}
}
