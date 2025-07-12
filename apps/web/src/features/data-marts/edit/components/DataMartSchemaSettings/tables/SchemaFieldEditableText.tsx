import { useState, useRef, type KeyboardEvent } from 'react';
import { Textarea } from '@owox/ui/components/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@owox/ui/components/popover';
import { Button } from '@owox/ui/components/button';
import { cn } from '@owox/ui/lib/utils';

interface SchemaFieldEditableTextProps {
  value: string;
  placeholder?: string;
  onValueChange?: (newValue: string) => void;
  useTextarea?: boolean;
  minRows?: number;
}

export function SchemaFieldEditableText({
  value,
  placeholder = '',
  onValueChange,
  minRows = 1,
}: SchemaFieldEditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle textarea change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedValue(e.target.value);
  };

  // Handle save
  const handleSave = () => {
    if (onValueChange && editedValue !== value) {
      onValueChange(editedValue.trim());
    }
    setIsEditing(false);
  };

  // Handle cancel
  const handleCancel = () => {
    setEditedValue(value);
    setIsEditing(false);
  };

  // Handle key down events
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (minRows === 1 || e.ctrlKey) {
        e.preventDefault();
        handleSave();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  // Focus textarea when popover opens
  const handleOpenChange = (open: boolean) => {
    setIsEditing(open);
    if (open) {
      setEditedValue(value);
      // Use setTimeout to ensure the textarea is rendered before focusing
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 0);
    } else {
      handleCancel();
    }
  };

  return (
    <Popover open={isEditing} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <div className={cn('cursor-edit', !value && 'text-gray-400 italic')}>
          {value || placeholder}
        </div>
      </PopoverTrigger>
      <PopoverContent className='w-auto min-w-[300px] p-2' align='start'>
        <Textarea
          ref={textareaRef}
          value={editedValue}
          // placeholder={placeholder}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className='min-h-[80px] resize-y'
          style={{ minHeight: String(Math.max(minRows * 24, 24)) + 'px' }}
          rows={minRows}
        />
        <div className='mt-2 flex justify-end gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleCancel}
            className='h-7 cursor-pointer px-2 text-xs'
          >
            Discard
          </Button>
          <Button size='sm' onClick={handleSave} className='h-7 cursor-pointer px-2 text-xs'>
            Save
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
