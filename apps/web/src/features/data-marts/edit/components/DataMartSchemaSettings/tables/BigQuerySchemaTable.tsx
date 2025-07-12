import type { ColumnDef } from '@tanstack/react-table';
import { useCallback, useMemo } from 'react';
import type { BigQuerySchemaField } from '../../../../shared/types/data-mart-schema.types.ts';
import {
  BigQueryFieldMode,
  BigQueryFieldType,
  DataMartSchemaFieldStatus,
} from '../../../../shared/types/data-mart-schema.types.ts';
import { ActionsDropdown } from './ActionsDropdown';
import { asString } from './schema-utils.ts';
import { SchemaFieldEditableText } from './SchemaFieldEditableText';
import { SchemaFieldModeSelect } from './SchemaFieldModeSelect';
import { SchemaFieldPrimaryKeyCheckbox } from './SchemaFieldPrimaryKeyCheckbox';
import { SchemaFieldStatusIcon } from './SchemaFieldStatusIcon';
import { SchemaFieldTypeSelect } from './SchemaFieldTypeSelect';
import { SchemaTable } from './SchemaTable';

interface BigQuerySchemaTableProps {
  fields: BigQuerySchemaField[];
  onFieldsChange?: (fields: BigQuerySchemaField[]) => void;
}

export function BigQuerySchemaTable({ fields, onFieldsChange }: BigQuerySchemaTableProps) {
  // Handler to update a field
  const updateField = useCallback(
    (index: number, updatedField: Partial<BigQuerySchemaField>) => {
      if (onFieldsChange) {
        const newFields = [...fields];
        newFields[index] = { ...newFields[index], ...updatedField };
        onFieldsChange(newFields);
      }
    },
    [fields, onFieldsChange]
  );

  // Handler to add a new row
  const handleAddRow = () => {
    if (onFieldsChange) {
      const newField: BigQuerySchemaField = {
        name: '',
        type: BigQueryFieldType.STRING,
        mode: BigQueryFieldMode.NULLABLE,
        isPrimaryKey: false,
        status: DataMartSchemaFieldStatus.DISCONNECTED,
      };
      onFieldsChange([...fields, newField]);
    }
  };

  // Handler to delete a row
  const handleDeleteRow = useCallback(
    (index: number) => {
      if (onFieldsChange) {
        const newFields = [...fields];
        newFields.splice(index, 1);
        onFieldsChange(newFields);
      }
    },
    [fields, onFieldsChange]
  );

  const columns = useMemo<ColumnDef<BigQuerySchemaField>[]>(
    () => [
      {
        accessorKey: 'status',
        header: '',
        cell: ({ row }) => <SchemaFieldStatusIcon status={row.getValue('status')} />,
        size: 24,
        enableHiding: false,
      },
      {
        accessorKey: 'name',
        header: 'Name',
        size: 80, //'auto' as unknown as number,
        cell: ({ row }) => (
          <SchemaFieldEditableText
            value={asString(row.getValue('name'))}
            onValueChange={value => {
              updateField(row.index, { name: value });
            }}
            placeholder={'Field name is required'}
          />
        ),
        enableHiding: false,
      },
      {
        accessorKey: 'type',
        header: 'Type',
        size: 80,
        cell: ({ row }) => (
          <SchemaFieldTypeSelect
            type={row.getValue('type')}
            storageType='bigquery'
            onTypeChange={value => {
              updateField(row.index, { type: value as BigQueryFieldType });
            }}
          />
        ),
        enableHiding: false,
      },
      {
        accessorKey: 'mode',
        header: 'Mode',
        size: 80,
        cell: ({ row }) => (
          <SchemaFieldModeSelect
            mode={row.getValue('mode')}
            onModeChange={value => {
              updateField(row.index, { mode: value });
            }}
          />
        ),
      },
      {
        accessorKey: 'isPrimaryKey',
        header: 'PK',
        size: 24,
        cell: ({ row }) => (
          <SchemaFieldPrimaryKeyCheckbox
            isPrimaryKey={row.getValue('isPrimaryKey')}
            onPrimaryKeyChange={value => {
              updateField(row.index, { isPrimaryKey: value });
            }}
          />
        ),
        enableHiding: false, // Cannot be hidden
      },
      {
        accessorKey: 'alias',
        header: 'Alias',
        size: 80,
        cell: ({ row }) => (
          <SchemaFieldEditableText
            value={row.getValue('alias')}
            onValueChange={value => {
              updateField(row.index, { alias: value });
            }}
            placeholder={'-'}
          />
        ),
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => (
          <SchemaFieldEditableText
            value={row.getValue('description')}
            onValueChange={value => {
              updateField(row.index, { description: value });
            }}
            minRows={5}
            placeholder={'-'}
          />
        ),
      },
      {
        id: 'actions',
        header: ({ table }) => <ActionsDropdown table={table} />,
        cell: ({ row, table }) => (
          <ActionsDropdown
            table={table}
            row={row}
            onDeleteRow={onFieldsChange ? handleDeleteRow : undefined}
          />
        ),
        size: 40,
        enableResizing: false,
        enableHiding: false,
      },
    ],
    [updateField, handleDeleteRow, onFieldsChange]
  );

  return (
    <SchemaTable
      fields={fields}
      columns={columns}
      onFieldsChange={onFieldsChange}
      onAddRow={onFieldsChange ? handleAddRow : undefined}
    />
  );
}
