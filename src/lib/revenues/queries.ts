import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Revenue, RevenueListItem } from "@/lib/revenues/types";

type RevenueRow = {
  id: string;
  amount: string;
  revenue_date: string;
  source: string | null;
  description: string | null;
  created_at: string;
  apartment: { name: string; unit_code: string | null } | { name: string; unit_code: string | null }[] | null;
};

function normalizeApartmentJoin(
  apartment: RevenueRow["apartment"],
): RevenueListItem["apartment"] {
  if (!apartment) {
    return { name: "—", unit_code: null };
  }

  if (Array.isArray(apartment)) {
    return apartment[0] ?? { name: "—", unit_code: null };
  }

  return apartment;
}

export async function fetchRevenuesForAdmin(): Promise<RevenueListItem[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("revenues")
    .select(
      "id, amount, revenue_date, source, description, created_at, apartment:apartments(name, unit_code)",
    )
    .order("revenue_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as RevenueRow[]).map((row) => ({
    id: row.id,
    amount: row.amount,
    revenue_date: row.revenue_date,
    source: row.source,
    description: row.description,
    created_at: row.created_at,
    apartment: normalizeApartmentJoin(row.apartment),
  }));
}

export async function fetchRevenueById(id: string): Promise<Revenue | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("revenues")
    .select("id, apartment_id, amount, revenue_date, source, description, created_by, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as Revenue;
}
