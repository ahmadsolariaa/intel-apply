export type ContractRow = {
  id: string;
  createdDate: string;
  institution: string;
  contractNumber: string;
  stage: string;
  businessLicense: boolean;
  contractSigning: string;
  contractStatus: "Inactive" | "Active";
  signedExpiry: string;
};

export const CONTRACT_TABS = [
  "All Contracts",
  "New Contractual Enquiry",
  "Under Review",
  "Contract Signing",
  "Signed Contracts",
  "Closed Enquiry",
  "Explore",
] as const;

export const CONTRACTS: ContractRow[] = [
  {
    id: "1",
    createdDate: "8th Aug 2026",
    institution: "Arden University",
    contractNumber: "Arden University UK 08/08/2026",
    stage: "New enquiry or Under review",
    businessLicense: true,
    contractSigning: "Contract Not Issued",
    contractStatus: "Inactive",
    signedExpiry: "N/A",
  },
  {
    id: "2",
    createdDate: "8th Aug 2026",
    institution: "GISMA Business School",
    contractNumber: "GISMA UZ 08/08/2026",
    stage: "Contract Signing",
    businessLicense: true,
    contractSigning: "Pending With Agent",
    contractStatus: "Inactive",
    signedExpiry: "N/A",
  },
  {
    id: "3",
    createdDate: "2nd Jul 2026",
    institution: "University of Europe",
    contractNumber: "UE Germany 02/07/2026",
    stage: "Closed enquiry",
    businessLicense: true,
    contractSigning: "Contract Not Issued",
    contractStatus: "Inactive",
    signedExpiry: "N/A",
  },
];
