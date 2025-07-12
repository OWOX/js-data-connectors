import { Checkbox } from '@owox/ui/components/checkbox';

interface SchemaFieldPrimaryKeyCheckboxProps {
  isPrimaryKey: unknown;
  onPrimaryKeyChange?: (isPrimaryKey: boolean) => void;
}

export function SchemaFieldPrimaryKeyCheckbox({
  isPrimaryKey,
  onPrimaryKeyChange,
}: SchemaFieldPrimaryKeyCheckboxProps) {
  // Convert to boolean to ensure proper type
  const isPrimaryKeyBoolean = Boolean(isPrimaryKey);

  // Handle checkbox change
  const handleCheckedChange = (checked: boolean) => {
    if (onPrimaryKeyChange) {
      onPrimaryKeyChange(checked);
    }
  };

  return (
    <Checkbox
      checked={isPrimaryKeyBoolean}
      onCheckedChange={handleCheckedChange}
      aria-label='Primary Key'
      tabIndex={0}
    />
  );
}
