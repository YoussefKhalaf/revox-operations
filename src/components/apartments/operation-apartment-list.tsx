import type { OperationApartment } from "@/lib/apartments/types";

type OperationApartmentListProps = {
  apartments: OperationApartment[];
};

function formatOptional(value: string | null) {
  return value && value.trim().length > 0 ? value : "—";
}

export function OperationApartmentList({ apartments }: OperationApartmentListProps) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-lg border border-border bg-card shadow-sm md:block">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-background">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                Apartment Name
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                Unit Code
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                Address
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {apartments.map((apartment) => (
              <tr key={apartment.id}>
                <td className="px-4 py-3 text-sm font-medium text-foreground">{apartment.name}</td>
                <td className="px-4 py-3 text-sm text-muted">{formatOptional(apartment.unit_code)}</td>
                <td className="px-4 py-3 text-sm text-muted">{formatOptional(apartment.address)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {apartments.map((apartment) => (
          <article
            key={apartment.id}
            className="rounded-lg border border-border bg-card p-4 shadow-sm"
          >
            <h3 className="text-sm font-semibold text-foreground">{apartment.name}</h3>
            <p className="mt-1 text-sm text-muted">{formatOptional(apartment.unit_code)}</p>
            <p className="text-sm text-muted">{formatOptional(apartment.address)}</p>
          </article>
        ))}
      </div>
    </>
  );
}
