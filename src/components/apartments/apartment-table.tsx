import Link from "next/link";
import {
  deleteApartmentAction,
} from "@/app/actions/delete-records";
import { DeleteRecordButton } from "@/components/delete-record-button";
import type { Apartment } from "@/lib/apartments/types";

type ApartmentTableProps = {
  apartments: Apartment[];
};

function formatOptional(value: string | null) {
  return value && value.trim().length > 0 ? value : "—";
}

function RowActions({ apartmentId }: { apartmentId: string }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link
        href={`/apartments/${apartmentId}/edit`}
        className="font-medium text-accent hover:underline"
      >
        Edit
      </Link>
      <DeleteRecordButton
        recordId={apartmentId}
        confirmMessage="Delete this apartment? This cannot be undone."
        deleteAction={deleteApartmentAction}
      />
    </div>
  );
}

export function ApartmentTable({ apartments }: ApartmentTableProps) {
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
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {apartments.map((apartment) => (
              <tr key={apartment.id}>
                <td className="px-4 py-3 text-sm font-medium text-foreground">{apartment.name}</td>
                <td className="px-4 py-3 text-sm text-muted">{formatOptional(apartment.unit_code)}</td>
                <td className="px-4 py-3 text-sm text-muted">{formatOptional(apartment.address)}</td>
                <td className="px-4 py-3 text-sm text-foreground">
                  {apartment.status === "active" ? "Active" : "Inactive"}
                </td>
                <td className="px-4 py-3 text-sm">
                  <RowActions apartmentId={apartment.id} />
                </td>
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
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">{apartment.name}</h3>
                <p className="mt-1 text-sm text-muted">{formatOptional(apartment.unit_code)}</p>
                <p className="text-sm text-muted">{formatOptional(apartment.address)}</p>
              </div>
              <RowActions apartmentId={apartment.id} />
            </div>
            <p className="mt-3 text-sm">
              <span className="text-muted">Status: </span>
              <span className="font-medium text-foreground">
                {apartment.status === "active" ? "Active" : "Inactive"}
              </span>
            </p>
          </article>
        ))}
      </div>
    </>
  );
}
