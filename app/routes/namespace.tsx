import { Link, useLoaderData, Form, useActionData, useNavigation } from "react-router";
import type { Route } from "./+types/namespace";
import Container from "~/components/container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { getNamespace, queryNamespace, type FilterCondition, type RankBy } from "~/lib/turbopuffer.server";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible";
import { QueryBuilder } from "~/components/QueryBuilder";
import { QueryResults } from "~/components/QueryResults";
import type { Filter } from "~/components/FilterField";
import { useState } from "react";

export const loader = async ({ params }: Route.ComponentProps) => {
  const metadata = await getNamespace({ id: params.id });
  return {
    namespace: {
      id: params.id,
      ...metadata,
    },
  };
}

export const action = async ({ params, request }: Route.ComponentProps) => {
  const formData = await request.formData();
  const filtersJson = formData.get("filters") as string;
  const orderByJson = formData.get("orderBy") as string;
  const topKValue = formData.get("topK") as string;
  
  try {
    const filters: Filter[] = filtersJson ? JSON.parse(filtersJson) : [];
    const orderBy = orderByJson ? JSON.parse(orderByJson) : null;
    const topK = topKValue ? Number(topKValue) : 100;
    
    // Get schema to determine non-vector attributes
    const metadata = await getNamespace({ id: params.id });
    const schema = (metadata as any)?.schema as Record<string, any> | undefined;
    
    const includeAttributes = schema 
      ? Object.keys(schema).filter(key => {
          const fieldConfig = schema[key];
          return !(typeof fieldConfig === "object" && 
                  fieldConfig?.type?.includes("f32") && 
                  fieldConfig?.type?.includes("["));
        })
      : undefined;
    
    let queryFilters: FilterCondition[] | undefined;
    let rankBy: RankBy | undefined;
    
    if (filters.length > 0) {
      queryFilters = filters.map(f => [f.field, f.operator, f.value] as FilterCondition);
    }
    
    if (orderBy) {
      rankBy = [orderBy.field, orderBy.direction];
    }
    
    let finalFilters: any = undefined;
    if (queryFilters && queryFilters.length === 1) {
      finalFilters = queryFilters[0];
    } else if (queryFilters && queryFilters.length > 1) {
      finalFilters = ["And", queryFilters];
    }
    
    const result = await queryNamespace({
      id: params.id,
      filters: finalFilters,
      rankBy,
      topK,
      includeAttributes,
    });
    
    return { success: true, results: result };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Query failed" 
    };
  }
}

export default function Namespace() {
  const { namespace } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [querySubmitted, setQuerySubmitted] = useState(false);
  
  const isQuerying = navigation.state === "submitting" && navigation.formAction?.includes("namespace");
  
  const formatNumber = (n: number | undefined) =>
    typeof n === "number" ? new Intl.NumberFormat().format(n) : "—";

  const formatBytes = (bytes: number | undefined) => {
    if (typeof bytes !== "number") return "—";
    const units = ["B", "KB", "MB", "GB", "TB"] as const;
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(size < 10 && unitIndex > 0 ? 1 : 0)} ${units[unitIndex]}`;
  };

  const formatDate = (iso: string | undefined) =>
    iso ? new Date(iso).toLocaleString() : "—";

  const schema = (namespace as any)?.schema as Record<string, any> | undefined;

  const topLevelEntries: Array<[string, any]> = schema && typeof schema === "object"
    ? Object.entries(schema)
    : [];

  const copySchema = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(schema ?? {}, null, 2));
    } catch {}
  };

  const handleQuery = (filters: Filter[], orderBy?: { field: string; direction: "asc" | "desc" }, topK?: number) => {
    const formElement = document.querySelector("#query-form") as HTMLFormElement;
    if (formElement) {
      const filtersInput = formElement.querySelector("#filters-input") as HTMLInputElement;
      const orderByInput = formElement.querySelector("#orderby-input") as HTMLInputElement;
      const topKInput = formElement.querySelector("#topk-input") as HTMLInputElement;
      
      filtersInput.value = JSON.stringify(filters);
      orderByInput.value = orderBy ? JSON.stringify(orderBy) : "";
      topKInput.value = String(topK || 100);
      
      formElement.requestSubmit();
      setQuerySubmitted(true);
    }
  };

  return (
    <Container>
      <div>
        <Button asChild variant="ghost" size="sm" aria-label="Back to home">
          <Link to="/">
            <ArrowLeft />
            Home
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Namespace</h1>
          <p className="text-sm text-muted-foreground">Details and schema for your namespace.</p>
        </div>

        <Badge variant="secondary" className="font-mono">{namespace.id}</Badge>
      </div>

      <Separator />

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">Metadata</CardTitle>
          <CardDescription>Key information about this namespace.</CardDescription>
        </CardHeader>

        <CardContent className="py-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Identifier</div>
              <div className="font-mono text-sm break-all">{namespace.id}</div>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Created</div>
              <div className="text-sm">{formatDate((namespace as any)?.created_at)}</div>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Approx. Rows</div>
              <div className="text-sm">{formatNumber((namespace as any)?.approx_row_count)}</div>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Approx. Size</div>
              <div className="text-sm">{formatBytes((namespace as any)?.approx_logical_bytes)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Form method="post" id="query-form" className="hidden">
        <input type="hidden" name="filters" id="filters-input" />
        <input type="hidden" name="orderBy" id="orderby-input" />
        <input type="hidden" name="topK" id="topk-input" />
      </Form>

      {schema && (
        <QueryBuilder 
          schema={schema} 
          onQuery={handleQuery}
          isLoading={isQuerying}
        />
      )}

      {(querySubmitted || actionData) && (
        <QueryResults
          results={actionData?.success ? actionData.results : null}
          isLoading={isQuerying}
          error={actionData?.success === false ? actionData.error : undefined}
        />
      )}

      <Card>
        <Collapsible defaultOpen>
          <CardHeader className="border-b">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">Schema</CardTitle>
              <CardDescription className="flex-1">Field definitions and configuration.</CardDescription>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Toggle schema" className="transition-transform data-[state=open]:rotate-180">
                  <ChevronDown />
                </Button>
              </CollapsibleTrigger>
            </div>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="py-4 space-y-4">
              {topLevelEntries.length > 0 ? (
                <div className="space-y-4">
                  <div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Field</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Filterable</TableHead>
                          <TableHead>Notes</TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {topLevelEntries.map(([key, value]) => {
                          const valueType = typeof value === "object" && value?.type
                            ? String(value.type)
                            : Array.isArray(value)
                              ? "array"
                              : typeof value;
                          const filterable = typeof value === "object" && value && "filterable" in value
                            ? Boolean((value as any).filterable)
                            : undefined;
                          const notes = typeof value === "object" && value ? Object.keys(value).filter(k => k !== "type" && k !== "filterable").slice(0, 4).join(", ") : "";

                          return (
                            <TableRow key={key}>
                              <TableCell className="font-mono text-xs">{key}</TableCell>
                              <TableCell className="text-sm">{valueType}</TableCell>
                              <TableCell className="text-sm">
                                {filterable === undefined ? "—" : (
                                  filterable ? <Badge className="bg-secondary text-secondary-foreground" variant="secondary">yes</Badge> : <Badge variant="outline">no</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">{notes || ""}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  <Separator />

                  <div>
                    <div className="text-xs text-muted-foreground mb-2">Raw JSON</div>
                    <pre className="bg-muted/50 border rounded-md p-4 text-xs overflow-auto max-h-[480px]">
{JSON.stringify(schema ?? {}, null, 2)}
                    </pre>
                    <div className="mt-2">
                      <Button variant="outline" size="sm" onClick={copySchema}>Copy JSON</Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No schema available.</div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </Container>
  );
}
