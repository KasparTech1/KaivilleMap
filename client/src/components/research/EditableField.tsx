import React from 'react';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { X, Plus } from 'lucide-react';
import { Button } from '../ui/button';

interface EditableFieldProps {
  label: string;
  value: any;
  type: 'text' | 'select' | 'textarea' | 'list' | 'number';
  options?: Array<{ value: string; label: string }>;
  onChange: (value: any) => void;
  readOnly?: boolean;
  placeholder?: string;
  className?: string;
}

export const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  type,
  options = [],
  onChange,
  readOnly = false,
  placeholder,
  className = '',
}) => {
  const handleListAdd = () => {
    onChange([...(value || []), '']);
  };

  const handleListRemove = (index: number) => {
    const newList = [...(value || [])];
    newList.splice(index, 1);
    onChange(newList);
  };

  const handleListItemChange = (index: number, newValue: string) => {
    const newList = [...(value || [])];
    newList[index] = newValue;
    onChange(newList);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={label} className="text-sm font-medium">
        {label}
      </Label>

      {type === 'text' && (
        <Input
          id={label}
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={readOnly}
          placeholder={placeholder}
          className="w-full"
        />
      )}

      {type === 'number' && (
        <Input
          id={label}
          type="number"
          value={value || ''}
          onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : null)}
          disabled={readOnly}
          placeholder={placeholder}
          className="w-full"
        />
      )}

      {type === 'textarea' && (
        <Textarea
          id={label}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={readOnly}
          placeholder={placeholder}
          rows={3}
          className="w-full resize-none"
        />
      )}

      {type === 'select' && (
        <Select
          value={value || ''}
          onValueChange={onChange}
          disabled={readOnly}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={placeholder || `Select ${label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {type === 'list' && (
        <div className="space-y-2">
          {(value || []).map((item: string, index: number) => (
            <div key={index} className="flex gap-2">
              <Input
                value={item}
                onChange={(e) => handleListItemChange(index, e.target.value)}
                disabled={readOnly}
                placeholder={`${label} item ${index + 1}`}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleListRemove(index)}
                disabled={readOnly}
                className="px-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={handleListAdd}
            disabled={readOnly}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add {label}
          </Button>
        </div>
      )}
    </div>
  );
};