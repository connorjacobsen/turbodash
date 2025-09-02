import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";

interface QueryResultsProps {
  results: any | null;
  isLoading?: boolean;
  error?: string;
}

export function QueryResults({ results, isLoading, error }: QueryResultsProps) {
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

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "—";
    if (typeof value === "boolean") return value ? "true" : "false";
    if (typeof value === "object") return JSON.stringify(value);
    if (typeof value === "string" && value.length > 100) {
      return value.substring(0, 100) + "...";
    }
    return String(value);
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
        <div className="overflow-auto max-h-[600px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">ID</TableHead>
                {allAttributeKeys.map((key) => (
                  <TableHead key={key} className="font-mono text-xs">
                    {key}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono text-xs">{row.id}</TableCell>
                  {allAttributeKeys.map((key) => (
                    <TableCell key={key} className="text-sm max-w-[200px] truncate">
                      {formatValue(row[key])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}