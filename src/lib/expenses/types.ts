export type Expense = {
  id: string;
  apartment_id: string;
  paid_by_member_id: string | null;
  cash_advance_id: string | null;
  category: string;
  description: string;
  amount: string;
  expense_date: string;
  receipt_path: string | null;
  created_by: string;
  created_at: string;
};

export type ExpenseListItem = {
  id: string;
  amount: string;
  expense_date: string;
  category: string;
  description: string;
  created_at: string;
  paid_by_member_id: string | null;
  cash_advance_id: string | null;
  apartment: {
    name: string;
    unit_code: string | null;
  };
  operation_members: {
    full_name: string;
  } | null;
};

export type OperationExpenseListItem = {
  id: string;
  amount: string;
  expense_date: string;
  category: string;
  description: string;
  created_at: string;
  cash_advance_id: string | null;
  apartment: {
    name: string;
    unit_code: string | null;
  };
};

export type ExpenseFormValues = {
  apartment_id: string;
  paid_by: string;
  cash_advance_id: string;
  category: string;
  description: string;
  amount: string;
  expense_date: string;
};

export type OperationExpenseFormValues = {
  apartment_id: string;
  cash_advance_id: string;
  category: string;
  description: string;
  amount: string;
  expense_date: string;
};

export type OperationMemberOption = {
  id: string;
  full_name: string;
};
