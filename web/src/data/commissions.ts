export type CommissionRow = {
  id: string;
  createdDate: string;
  caseNumber: string;
  subject: string;
  institution: string;
  status: "Completed" | "Pending";
  intake: string;
  totalInvoice: string;
};

export const COMMISSION_TABS = [
  "All",
  "New",
  "Statement",
  "Invoice",
  "Payment",
  "Closed",
  "Explore",
] as const;

export const COMMISSION_SUMMARY = [
  {label: "Pending Statement Review", value: "0"},
  {label: "Invoice in Validation", value: "0"},
  {label: "Invoice Rejected", value: "0"},
  {label: "Sent for Payment", value: "0"},
  {label: "Payment Completed", value: "2"},
  {label: "Case Closed", value: "2"},
];

export const COMMISSIONS: CommissionRow[] = [
  {
    id: "1",
    createdDate: "27th Feb 2025",
    caseNumber: "00712406",
    subject: "Commission - Avila University",
    institution: "Avila University",
    status: "Completed",
    intake: "SP1-25",
    totalInvoice: "1250",
  },
  {
    id: "2",
    createdDate: "10th Nov 2025",
    caseNumber: "02725741",
    subject: "Commission - Avila University",
    institution: "Avila University",
    status: "Completed",
    intake: "FA1-25",
    totalInvoice: "1750",
  },
];
