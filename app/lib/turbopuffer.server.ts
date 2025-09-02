import { Turbopuffer } from "@turbopuffer/turbopuffer";
import 'dotenv/config';

export const tpuf = new Turbopuffer({
  apiKey: process.env.TURBOPUFFER_API_KEY!,
  region: process.env.TURBOPUFFER_REGION!,
});

export async function listNamespaces({
  cursor,
  prefix,
  pageSize,
}: {
  cursor?: string;
  prefix?: string;
  pageSize?: number;
}) {
  return await tpuf.namespaces({
    cursor,
    prefix,
    page_size: pageSize ?? 100,
  });
}

export async function getNamespace({
  id,
}: {
  id: string;
}) {
  const ns = tpuf.namespace(id);
  return await ns.metadata();
}

export type FilterOperator = "Eq" | "NotEq" | "Gt" | "Gte" | "Lt" | "Lte" | "In" | "NotIn" | "Contains" | "NotContains";
export type FilterCondition = [string, FilterOperator, any];
export type QueryFilters = ["And", FilterCondition[]] | FilterCondition;
export type RankBy = [string, "asc" | "desc"] | ["vector", "ANN", number[]];

export async function queryNamespace({
  id,
  filters,
  rankBy,
  topK = 100,
  includeAttributes,
}: {
  id: string;
  filters?: QueryFilters;
  rankBy?: RankBy;
  topK?: number;
  includeAttributes?: string[];
}) {
  const ns = tpuf.namespace(id);
  return await ns.query({
    filters,
    rank_by: rankBy,
    top_k: topK,
    include_attributes: includeAttributes,
  });
}
