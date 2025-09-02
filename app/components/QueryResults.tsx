import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { ChevronDown, ChevronRight, Copy } from "lucide-react";

interface QueryResultsProps {
  results: any | null;
  isLoading?: boolean;
  error?: string;
}

export function QueryResults({ results, isLoading, error }: QueryResultsProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRowExpansion = (rowId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowId)) {
      newExpanded.delete(rowId);
    } else {
      newExpanded.add(rowId);
    }
    setExpandedRows(newExpanded);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">Query Results</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Executing query...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">Query Results</CardTitle>
          <CardDescription>Error occurred</CardDescription>
        </CardHeader>
        <CardContent className="py-4">
          <div className="text-destructive text-sm">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (!results || !results.rows) {
    return null;
  }

  const { rows } = results;

  if (rows.length === 0) {
    return (
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">Query Results</CardTitle>
          <CardDescription>No matches found</CardDescription>
        </CardHeader>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">No documents match your filters.</div>
        </CardContent>
      </Card>
    );
  }

  const allAttributeKeys = Array.from(
    new Set(rows.flatMap(row => Object.keys(row).filter(key => key !== "id" && key !== "dist")))
  );

  const formatValue = (value: any, truncate = true): string => {
    if (value === null || value === undefined) return "—";
    if (typeof value === "boolean") return value ? "true" : "false";
    if (typeof value === "object") return JSON.stringify(value, null, 2);
    if (typeof value === "string" && truncate && value.length > 100) {
      return value.substring(0, 100) + "...";
    }
    return String(value);
  };

  const isValueLong = (value: any): boolean => {
    if (typeof value === "string") return value.length > 100;
    if (typeof value === "object") return JSON.stringify(value).length > 100;
    return false;
  };

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="text-base flex items-center gap-2">
          Query Results
          <Badge variant="secondary" className="font-mono">
            {rows.length} {rows.length === 1 ? "row" : "rows"}
          </Badge>
        </CardTitle>
        <CardDescription>Documents matching your filters</CardDescription>
      </CardHeader>
      
      <CardContent className="py-4">
        <TooltipProvider>
          <div className="overflow-auto max-h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead className="w-16">ID</TableHead>
                  {allAttributeKeys.map((key) => (
                    <TableHead key={key} className="font-mono text-xs">
                      {key}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  const rowId = String(row.id);
                  const isExpanded = expandedRows.has(rowId);
                  const hasLongContent = allAttributeKeys.some(key => isValueLong(row[key]));
                  
                  return (
                    <>
                      <TableRow key={row.id} className={`group ${isExpanded ? "border-b-0" : ""}`}>
                        <TableCell className="p-1">
                          {hasLongContent && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => toggleRowExpansion(rowId)}
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-3 w-3" />
                              ) : (
                                <ChevronRight className="h-3 w-3" />
                              )}
                            </Button>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{row.id}</TableCell>
                        {allAttributeKeys.map((key) => {
                          const value = row[key];
                          const formattedValue = formatValue(value);
                          const fullValue = formatValue(value, false);
                          const hasContent = value && String(value).length > 0;
                          
                          return (
                            <TableCell key={key} className="text-sm max-w-[200px]">
                              <div className="flex items-center gap-1">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="truncate cursor-help">
                                      {formattedValue}
                                    </div>
                                  </TooltipTrigger>
                                  {hasContent && (
                                    <TooltipContent side="top" className="max-w-[400px] whitespace-pre-wrap">
                                      {fullValue}
                                    </TooltipContent>
                                  )}
                                </Tooltip>
                                {value && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-4 w-4 opacity-0 group-hover:opacity-100 hover:opacity-100"
                                    onClick={() => copyToClipboard(fullValue)}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                      {isExpanded && (
                        <TableRow key={`${row.id}-expanded`} className="border-t-0">
                          <TableCell></TableCell>
                          <TableCell colSpan={allAttributeKeys.length + 1} className="bg-muted/20 p-4">
                            <div className="space-y-3">
                              {allAttributeKeys.map((key) => {
                                const value = row[key];
                                if (!isValueLong(value)) return null;
                                
                                return (
                                  <div key={key} className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <div className="font-mono text-xs text-muted-foreground">{key}</div>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-4 w-4"
                                        onClick={() => copyToClipboard(formatValue(value, false))}
                                      >
                                        <Copy className="h-3 w-3" />
                                      </Button>
                                    </div>
                                    <div className="text-sm whitespace-pre-wrap bg-muted/30 p-2 rounded border text-left">
                                      {formatValue(value, false)}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}