export type NavItem = {
  label: string;
  href?: string;
  active?: boolean;
};

export function getNavigationItems(
  role: "admin" | "operation",
  activePath = "/",
): NavItem[] {
  if (role === "admin") {
    return [
      { label: "Dashboard", href: "/", active: activePath === "/" },
      {
        label: "Apartments",
        href: "/apartments",
        active: activePath.startsWith("/apartments"),
      },
      {
        label: "Income & Expenses",
        href: "/income-expenses",
        active: activePath.startsWith("/income-expenses"),
      },
      { label: "Cash Advances", href: "/cash-advances", active: activePath.startsWith("/cash-advances") },
      {
        label: "Operation Team",
        href: "/operation-team",
        active: activePath.startsWith("/operation-team"),
      },
    ];
  }

  return [
    { label: "Dashboard", href: "/", active: activePath === "/" },
    {
      label: "Apartments",
      href: "/apartments",
      active: activePath.startsWith("/apartments"),
    },
    {
      label: "My Expenses",
      href: "/my-expenses",
      active: activePath.startsWith("/my-expenses"),
    },
    {
      label: "My Cash Advances",
      href: "/my-cash-advances",
      active: activePath.startsWith("/my-cash-advances"),
    },
  ];
}

export function getRoleLabel(role: "admin" | "operation"): string {
  return role === "admin" ? "Administrator" : "Operation";
}
