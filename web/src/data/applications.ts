export type ApplicationRow = {
  id: string;
  createdDate: string;
  applicantName: string;
  email: string;
  institution: string;
  programme: string;
  progress: number;
  admissionStatus: string;
  lastUpdated: string;
};

export const APPLICATION_TABS = [
  "All Applications",
  "Draft Applications",
  "Document Review",
  "Pending Tasks",
  "Admission Review",
  "Unassigned Application",
  "Explore",
] as const;

export const APPLICATION_SUMMARY = [
  {label: "Application to Submit"},
  {label: "4 Application to Complete", value: "4"},
  {label: "45 Open Tasks", value: "45"},
  {label: "Completed Tasks"},
];

export const APPLICATIONS: ApplicationRow[] = [
  {
    id: "1",
    createdDate: "21st Nov 2024",
    applicantName: "Aziza Karimova",
    email: "aziza.k@example.com",
    institution: "CCU",
    programme: "MSc Computer Science",
    progress: 100,
    admissionStatus: "Application not complete",
    lastUpdated: "22nd Nov",
  },
  {
    id: "2",
    createdDate: "18th Jan 2025",
    applicantName: "Jasur Rakhimov",
    email: "jasur.r@example.com",
    institution: "GISMA",
    programme: "BA Business Administration",
    progress: 72,
    admissionStatus: "Application submitted",
    lastUpdated: "19th Jan",
  },
  {
    id: "3",
    createdDate: "3rd Mar 2025",
    applicantName: "Madina Tursunova",
    email: "madina.t@example.com",
    institution: "Arden University",
    programme: "MBA",
    progress: 45,
    admissionStatus: "Draft Application",
    lastUpdated: "4th Mar",
  },
  {
    id: "4",
    createdDate: "12th Jun 2025",
    applicantName: "Bobur Aliyev",
    email: "bobur.a@example.com",
    institution: "University of Law",
    programme: "BSc Accounting",
    progress: 88,
    admissionStatus: "Conditionally accepted",
    lastUpdated: "15th Jun",
  },
];
