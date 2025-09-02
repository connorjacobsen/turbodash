import { Input } from "~/components/ui/input";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import { X } from "lucide-react";
import type { FilterOperator } from "~/lib/turbopuffer.server";

export interface Filter {
  id: string;
  field: string;
  operator: FilterOperator;
  value: any;
}

interface FilterFieldProps {
  filter: Filter;
  fieldType: string;
  onUpdate: (filter: Filter) => void;
  onRemove: (id: string) => void;
}

const getOperatorsForType = (type: string): FilterOperator[] => {
  switch (type) {
    case "boolean":
      return ["Eq", "NotEq"];
    case "string":
      return ["Eq", "NotEq", "Contains", "NotContains"];
    case "number":
      return ["Eq", "NotEq", "Gt", "Gte", "Lt", "Lte"];
    default:
      return ["Eq", "NotEq"];
  }
};

const getDefaultValue = (type: string, operator: FilterOperator) => {
  if (type === "boolean") return true;
  if (type === "number") return 0;
  return "";
};

export function FilterField({ filter, fieldType, onUpdate, onRemove }: FilterFieldProps) {
  const operators = getOperatorsForType(fieldType);

  const handleOperatorChange = (operator: FilterOperator) => {
    const newValue = getDefaultValue(fieldType, operator);
    onUpdate({ ...filter, operator, value: newValue });
  };

  const handleValueChange = (value: any) => {
    onUpdate({ ...filter, value });
  };

  const renderValueInput = () => {
    switch (fieldType) {
      case "boolean":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={filter.value}
              onCheckedChange={handleValueChange}
            />
            <Label className="text-sm">{filter.value ? "True" : "False"}</Label>
          </div>
        );
      case "number":
        return (
          <Input
            type="number"
            value={filter.value}
            onChange={(e) => handleValueChange(Number(e.target.value))}
            placeholder="Enter number"
          />
        );
      default:
        return (
          <Input
            type="text"
            value={filter.value}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder="Enter value"
          />
        );
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/20">
      <div className="font-mono text-sm text-muted-foreground min-w-0 flex-shrink-0">
        {filter.field}
      </div>
      
      <Select value={filter.operator} onValueChange={handleOperatorChange}>
        <SelectTrigger className="w-24">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {operators.map((op) => (
            <SelectItem key={op} value={op}>
              {op}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex-1">
        {renderValueInput()}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(filter.id)}
        className="h-8 w-8"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}