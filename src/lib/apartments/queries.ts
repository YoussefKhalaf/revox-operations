import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ApartmentOption } from "@/lib/finance/types";
import type { Apartment, OperationApartment } from "@/lib/apartments/types";
import { sortApartments } from "@/lib/apartments/types";

export async function fetchApartmentsForAdmin(): Promise<Apartment[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("apartments")
    .select("id, name, unit_code, address, status, notes, created_at, updated_at")
    .order("status", { ascending: true })
    .order("name", { ascending: true });

  if (error || !data) {
    return [];
  }

  return sortApartments(data as Apartment[]);
}

export async function fetchActiveApartmentsForOperation(): Promise<OperationApartment[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("apartments")
    .select("id, name, unit_code, address")
    .eq("status", "active")
    .order("name", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data as OperationApartment[];
}

export async function fetchApartmentById(id: string): Promise<Apartment | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("apartments")
    .select("id, name, unit_code, address, status, notes, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as Apartment;
}

export async function fetchActiveApartmentOptions(): Promise<ApartmentOption[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("apartments")
    .select("id, name, unit_code")
    .eq("status", "active")
    .order("name", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data as ApartmentOption[];
}

export async function fetchApartmentOptionsForEdit(
  currentApartmentId: string,
): Promise<ApartmentOption[]> {
  const supabase = await createServerSupabaseClient();

  const [{ data: activeApartments, error: activeError }, { data: currentApartment, error: currentError }] =
    await Promise.all([
      supabase
        .from("apartments")
        .select("id, name, unit_code")
        .eq("status", "active")
        .order("name", { ascending: true }),
      supabase
        .from("apartments")
        .select("id, name, unit_code")
        .eq("id", currentApartmentId)
        .maybeSingle(),
    ]);

  if (activeError || currentError) {
    return [];
  }

  const options = (activeApartments ?? []) as ApartmentOption[];

  if (
    currentApartment &&
    !options.some((option) => option.id === currentApartment.id)
  ) {
    options.push(currentApartment as ApartmentOption);
    options.sort((left, right) =>
      left.name.localeCompare(right.name, undefined, { sensitivity: "base" }),
    );
  }

  return options;
}

export async function isApartmentAllowedForNewEntry(apartmentId: string): Promise<boolean> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("apartments")
    .select("id")
    .eq("id", apartmentId)
    .eq("status", "active")
    .maybeSingle();

  return !error && Boolean(data);
}

export async function isApartmentAllowedForAdminEdit(
  apartmentId: string,
  currentApartmentId?: string,
): Promise<boolean> {
  if (currentApartmentId && apartmentId === currentApartmentId) {
    return true;
  }

  return isApartmentAllowedForNewEntry(apartmentId);
}
