import type { ConnectorFieldsResponseApiDto } from '../../../../../data-storage/shared/api/types/response/connector.response.dto.ts';

interface FieldsSelectionStepProps {
  connectorFields: ConnectorFieldsResponseApiDto[] | null;
  selectedField: string;
  selectedFields: string[];
  onFieldToggle: (fieldName: string, isChecked: boolean) => void;
}

export function FieldsSelectionStep({
  connectorFields,
  selectedField,
  selectedFields,
  onFieldToggle,
}: FieldsSelectionStepProps) {
  if (!selectedField || !connectorFields) {
    return null;
  }

  const selectedFieldData = connectorFields.find(field => field.name === selectedField);
  if (!selectedFieldData?.fields) {
    return null;
  }

  return (
    <div className='space-y-4'>
      <h4 className='text-lg font-medium'>Selected field for node: {selectedField}</h4>
      <p className='text-muted-foreground text-sm'>
        Select the fields you want to include in the connector.
      </p>
      <div className='flex flex-col gap-4'>
        {selectedFieldData.fields.map(field => (
          <div key={field.name} className='flex items-center space-x-2'>
            <input
              type='checkbox'
              id={`field-${field.name}`}
              name='selectedFields'
              value={field.name}
              className='text-primary focus:ring-primary h-4 w-4 border-gray-300'
              onChange={e => {
                onFieldToggle(field.name, e.target.checked);
              }}
              checked={selectedFields.includes(field.name)}
            />
            <label
              htmlFor={`field-${field.name}`}
              className='text-muted-foreground cursor-pointer text-sm'
            >
              {field.name}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
