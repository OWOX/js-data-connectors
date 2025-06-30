import { DataStorageType } from '../../../../../data-storage/shared/model/types';

interface TargetSetupStepProps {
  dataStorageType: DataStorageType;
  target: {
    type: DataStorageType;
    bigquery?: { datasetId: string };
    athena?: { databaseName: string; outputLocation: string };
  } | null;
  onTargetChange: (target: {
    type: DataStorageType;
    bigquery?: { datasetId: string };
    athena?: { databaseName: string; outputLocation: string };
  }) => void;
}

export function TargetSetupStep({ dataStorageType, target, onTargetChange }: TargetSetupStepProps) {
  return (
    <div className='space-y-4'>
      <h4 className='text-lg font-medium'>Setup target</h4>
      <div className='flex flex-col gap-4'>
        {dataStorageType === DataStorageType.GOOGLE_BIGQUERY && (
          <div className='flex items-center space-x-2'>
            <input
              type='text'
              id='dataset-name'
              placeholder='Enter dataset name'
              className='focus:ring-primary flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none'
              value={target?.bigquery?.datasetId ?? ''}
              onChange={e => {
                onTargetChange({
                  type: DataStorageType.GOOGLE_BIGQUERY,
                  bigquery: { datasetId: e.target.value },
                });
              }}
            />
            <label htmlFor='dataset-name' className='text-muted-foreground text-sm'>
              Dataset Name
            </label>
          </div>
        )}
        {dataStorageType === DataStorageType.AWS_ATHENA && (
          <div className='flex flex-col gap-4'>
            <input
              type='text'
              id='database-name'
              placeholder='Enter database name'
              className='focus:ring-primary flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none'
              value={target?.athena?.databaseName ?? ''}
              onChange={e => {
                onTargetChange({
                  type: DataStorageType.AWS_ATHENA,
                  athena: {
                    databaseName: e.target.value,
                    outputLocation: target?.athena?.outputLocation ?? '',
                  },
                });
              }}
            />
            <input
              type='text'
              id='table-name'
              placeholder='Enter output s3 location'
              className='focus:ring-primary flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none'
              value={target?.athena?.outputLocation ?? ''}
              onChange={e => {
                onTargetChange({
                  type: DataStorageType.AWS_ATHENA,
                  athena: {
                    databaseName: target?.athena?.databaseName ?? '',
                    outputLocation: e.target.value,
                  },
                });
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
