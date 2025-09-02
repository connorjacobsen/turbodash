import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { FilterField, type Filter } from "~/components/FilterField";
import { Plus, Search } from "lucide-react";
import { Separator } from "~/components/ui/separator";
import type { FilterOperator } from "~/lib/turbopuffer.server";

interface QueryBuilderProps {
  schema: Record<string, any>;
  onQuery: (
    filters: Filter[], 
    orderBy?: { field: string; direction: "asc" | "desc" }, 
    topK?: number,
    fullTextSearch?: { field: string; query: string; usePhaseMatching: boolean }
  ) => void;
  isLoading?: boolean;
}

const getFieldType = (fieldConfig: any): string => {
  if (typeof fieldConfig === "object" && fieldConfig?.type) {
    return String(fieldConfig.type);
  }
  if (Array.isArray(fieldConfig)) {
    return "array";
  }
  return typeof fieldConfig;
};

const getDefaultOperator = (type: string): FilterOperator => {
  switch (type) {
    case "boolean":
      return "Eq";
    case "number":
      return "Eq";
    default:
      return "Eq";
  }
};

const getDefaultValue = (type: string): any => {
  switch (type) {
    case "boolean":
      return true;
    case "number":
      return 0;
    default:
      return "";
  }
};

export function QueryBuilder({ schema, onQuery, isLoading }: QueryBuilderProps) {
  const [filters, setFilters] = useState<Filter[]>([]);
  const [selectedField, setSelectedField] = useState<string>("");
  const [orderBy, setOrderBy] = useState<{ field: string; direction: "asc" | "desc" } | undefined>();
  const [topK, setTopK] = useState<number>(100);
  const [fullTextSearch, setFullTextSearch] = useState<{ field: string; query: string; usePhaseMatching: boolean } | undefined>();

  const schemaFields = Object.keys(schema || {}).filter(key => {
    const fieldConfig = schema[key];
    return typeof fieldConfig === "object" && fieldConfig?.filterable !== false;
  });

  const fullTextSearchFields = Object.keys(schema || {}).filter(key => {
    const fieldConfig = schema[key];
    return typeof fieldConfig === "object" && (
      fieldConfig?.full_text_search === true || 
      (typeof fieldConfig?.full_text_search === "object" && fieldConfig?.full_text_search)
    );
  });

  const addFilter = () => {
    if (!selectedField) return;
    
    const fieldType = getFieldType(schema[selectedField]);
    const newFilter: Filter = {
      id: Math.random().toString(36).substr(2, 9),
      field: selectedField,
      operator: getDefaultOperator(fieldType),
      value: getDefaultValue(fieldType),
    };
    
    setFilters([...filters, newFilter]);
    setSelectedField("");
  };

  const updateFilter = (updatedFilter: Filter) => {
    setFilters(filters.map(f => f.id === updatedFilter.id ? updatedFilter : f));
  };

  const removeFilter = (id: string) => {
    setFilters(filters.filter(f => f.id !== id));
  };

  const handleQuery = () => {
    onQuery(filters, orderBy, topK, fullTextSearch);
  };

  const handleOrderByChange = (field: string) => {
    setOrderBy({ field, direction: "desc" });
  };

  const toggleOrderDirection = () => {
    if (orderBy) {
      setOrderBy({ ...orderBy, direction: orderBy.direction === "asc" ? "desc" : "asc" });
    }
  };

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="text-base">Query Data</CardTitle>
        <CardDescription>Filter and search your namespace data.</CardDescription>
      </CardHeader>
      
      <CardContent className="py-4 space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Select value={selectedField} onValueChange={setSelectedField}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select field to filter" />
              </SelectTrigger>
              <SelectContent>
                {schemaFields.map((field) => (
                  <SelectItem key={field} value={field}>
                    {field}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              onClick={addFilter} 
              disabled={!selectedField}
              size="sm"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Filter
            </Button>
          </div>

          {filters.length > 0 && (
            <div className="space-y-2">
              {filters.map((filter) => (
                <FilterField
                  key={filter.id}
                  filter={filter}
                  fieldType={getFieldType(schema[filter.field])}
                  onUpdate={updateFilter}
                  onRemove={removeFilter}
                />
              ))}
            </div>
          )}
        </div>

        {fullTextSearchFields.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                <div className="text-sm font-medium">Full Text Search</div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Select 
                    value={fullTextSearch?.field || ""} 
                    onValueChange={(field) => setFullTextSearch(prev => ({ 
                      field, 
                      query: prev?.query || "", 
                      usePhaseMatching: prev?.usePhaseMatching || false 
                    }))}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select field for FTS" />
                    </SelectTrigger>
                    <SelectContent>
                      {fullTextSearchFields.map((field) => (
                        <SelectItem key={field} value={field}>
                          {field}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {fullTextSearch?.field && (
                    <Input
                      placeholder="Enter search terms..."
                      value={fullTextSearch.query}
                      onChange={(e) => setFullTextSearch(prev => prev ? { ...prev, query: e.target.value } : undefined)}
                      className="flex-1"
                    />
                  )}
                </div>
                
                {fullTextSearch?.field && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={fullTextSearch.usePhaseMatching}
                      onCheckedChange={(checked) => 
                        setFullTextSearch(prev => prev ? { ...prev, usePhaseMatching: !!checked } : undefined)
                      }
                    />
                    <Label className="text-sm">Require all search terms (phrase matching)</Label>
                  </div>
                )}
              </div>
            </div>
            <Separator />
          </>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="text-sm font-medium">Order Results</div>
            <div className="flex items-center gap-2">
              <Select value={orderBy?.field || ""} onValueChange={handleOrderByChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Order by field (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(schema || {}).map((field) => (
                    <SelectItem key={field} value={field}>
                      {field}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {orderBy && (
                <Button 
                  onClick={toggleOrderDirection}
                  variant="outline"
                  size="sm"
                >
                  {orderBy.direction.toUpperCase()}
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-medium">Result Limit</div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                max="1200"
                value={topK}
                onChange={(e) => setTopK(Math.max(0, Math.min(1200, Number(e.target.value) || 0)))}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">rows (max 1200)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Button 
            onClick={handleQuery}
            disabled={isLoading}
            className="w-32"
          >
            {isLoading ? "Querying..." : "See Results"}
          </Button>
          
          {filters.length > 0 && (
            <Button 
              onClick={() => setFilters([])}
              variant="outline"
              size="sm"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}