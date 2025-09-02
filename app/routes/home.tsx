import { Link, useLoaderData, useNavigate } from "react-router";
import type { Route } from "./+types/home";
import Container from "~/components/container";
import { listNamespaces } from "~/lib/turbopuffer.server";
import { Separator } from "~/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction, CardFooter } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { useMemo, useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export const loader = async () => {
  const { namespaces, next_cursor } = await listNamespaces({});

  return {
    namespaces,
    nextCursor: next_cursor,
  };
};

export default function Home() {
  const { namespaces, nextCursor } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const filteredNamespaces = useMemo(() => {
    if (!query) return namespaces;
    const q = query.toLowerCase();
    return namespaces.filter((ns: { id: string }) => ns.id.toLowerCase().includes(q));
  }, [namespaces, query]);

  return (
    <Container>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Namespaces</h1>
          <p className="text-sm text-muted-foreground">Browse your Turbopuffer namespaces.</p>
        </div>
        <Badge variant="secondary">{namespaces.length}</Badge>
      </div>

      <Separator />

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">All namespaces</CardTitle>
          <CardDescription>Search and open a namespace.</CardDescription>
          <CardAction>
            <div className="w-64">
              <Input
                placeholder="Search namespaces..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </CardAction>
        </CardHeader>
        <CardContent className="py-4">
          {filteredNamespaces.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
              <p className="text-sm text-muted-foreground">
                {query ? "No namespaces match your search." : "No namespaces to display."}
              </p>
              {query ? (
                <Button variant="outline" size="sm" onClick={() => setQuery("")}>Clear search</Button>
              ) : null}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Identifier</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNamespaces.map((ns: { id: string }) => (
                  <TableRow
                    key={ns.id}
                    className="cursor-pointer"
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/namespace/${ns.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        navigate(`/namespace/${ns.id}`);
                      }
                    }}
                  >
                    <TableCell>
                      <span className="font-mono text-sm">{ns.id}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/namespace/${ns.id}`}>Open</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter className="justify-between text-xs text-muted-foreground">
          <span>Showing {filteredNamespaces.length} of {namespaces.length}</span>
          {nextCursor ? <span>More available</span> : <span>End of list</span>}
        </CardFooter>
      </Card>
    </Container>
  )
}
