export type ApartmentStatus = "active" | "inactive";

export type Apartment = {
  id: string;
  name: string;
  unit_code: string | null;
  address: string | null;
  status: ApartmentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type OperationApartment = {
  id: string;
  name: string;
  unit_code: string | null;
  address: string | null;
};

export type ApartmentFormValues = {
  name: string;
  unit_code: string;
  address: string;
  notes: string;
  status: ApartmentStatus;
};

export type ApartmentSummary = {
  total: number;
  active: number;
  inactive: number;
};

export function buildApartmentSummary(apartments: Apartment[]): ApartmentSummary {
  return {
    total: apartments.length,
    active: apartments.filter((apartment) => apartment.status === "active").length,
    inactive: apartments.filter((apartment) => apartment.status === "inactive").length,
  };
}

export function sortApartments<T extends { status: ApartmentStatus; name: string }>(
  apartments: T[],
): T[] {
  return [...apartments].sort((left, right) => {
    if (left.status !== right.status) {
      return left.status === "active" ? -1 : 1;
    }

    return left.name.localeCompare(right.name, undefined, { sensitivity: "base" });
  });
}
