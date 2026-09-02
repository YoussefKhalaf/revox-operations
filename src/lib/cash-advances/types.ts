export type CashAdvanceBalance = {
  cash_advance_id: string;
  operation_member_id: string;
  operation_member_name: string;
  issued_date: string;
  issued_amount: string;
  total_linked_expenses: string;
  total_returned: string;
  remaining_balance: string;
};

export type CashAdvance = {
  id: string;
  operation_member_id: string;
  amount: string;
  issued_date: string;
  notes: string | null;
  created_by: string;
  created_at: string;
};

export type CashAdvanceListItem = CashAdvanceBalance & {
  created_at: string;
};

export type CashAdvanceFormValues = {
  operation_member_id: string;
  amount: string;
  issued_date: string;
  notes: string;
};

export type CashAdvanceSummary = {
  totalIssued: string;
  totalSpent: string;
  totalReturned: string;
  outstandingBalance: string;
};

export type CashAdvanceOption = {
  id: string;
  issued_date: string;
  remaining_balance: string;
};

export type LinkedAdvanceExpense = {
  id: string;
  expense_date: string;
  amount: string;
  category: string;
  description: string;
  apartment: {
    name: string;
    unit_code: string | null;
  };
};

export type AdvanceReturn = {
  id: string;
  cash_advance_id: string;
  amount: string;
  return_date: string;
  notes: string | null;
  created_by: string;
  created_at: string;
};

export type AdvanceReturnFormValues = {
  amount: string;
  return_date: string;
  notes: string;
};

export type OperationCashAdvanceListItem = {
  cash_advance_id: string;
  issued_date: string;
  issued_amount: string;
  total_linked_expenses: string;
  total_returned: string;
  remaining_balance: string;
};

export type OperationCashAdvanceSummary = {
  totalIssued: string;
  totalSpent: string;
  totalReturned: string;
  remainingBalance: string;
};
