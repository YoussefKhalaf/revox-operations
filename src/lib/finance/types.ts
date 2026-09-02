export type ApartmentOption = {
  id: string;
  name: string;
  unit_code: string | null;
};

export type ApartmentLabel = {
  name: string;
  unit_code: string | null;
};

export function formatApartmentLabel(apartment: ApartmentLabel): string {
  if (apartment.unit_code && apartment.unit_code.trim().length > 0) {
    return `${apartment.name} (${apartment.unit_code})`;
  }

  return apartment.name;
}
