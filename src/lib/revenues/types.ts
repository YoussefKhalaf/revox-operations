export type Revenue = {
  id: string;
  apartment_id: string;
  amount: string;
  revenue_date: string;
  source: string | null;
  description: string | null;
  created_by: string;
  created_at: string;
};

export type RevenueListItem = {
  id: string;
  amount: string;
  revenue_date: string;
  source: string | null;
  description: string | null;
  created_at: string;
  apartment: {
    name: string;
    unit_code: string | null;
  };
};

export type RevenueFormValues = {
  apartment_id: string;
  amount: string;
  revenue_date: string;
  source: string;
  description: string;
};
