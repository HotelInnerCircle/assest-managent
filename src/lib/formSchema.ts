import { z } from "zod";

/* ================= EMPLOYEE ================= */
export const employeeSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(100)
    // ❌ Prevent numbers & special characters
    .regex(/^[A-Za-z\s]+$/, "Name must contain only letters"),
  number: z
    .string()
    .trim()
    // ✅ Must start with 6,7,8,9 and be exactly 10 digits
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),

  employeeId: z.string().trim().min(1, "Employee ID is required").max(50),
});

/* ================= JOB ================= */
export const jobSchema = z.object({
  company: z.string().min(1, "Company is required"),
  department: z.string().min(1, "Department is required"),
  designation: z.string().trim().min(1, "Designation is required").max(100),
});

/* ================= ASSETS ================= */
export const ASSET_OPTIONS = [
  "Laptop",
  "Desktop",
  "Mobile Phone",
  "Tablet / iPad",
  "SIM Card",
  "Headset",
  "Other Assets",
] as const;

export const assetSelectionSchema = z.object({
  selectedAssets: z.array(z.string()).min(1, "Select at least one asset"),
});

/* ================= LAPTOP ================= */
export const laptopSchema = z.object({
  brand: z.string().trim().min(1, "Brand is required"),
  serialNumber: z.string().trim().min(1, "Serial number is required"),
  accessories: z.array(z.string()).default([]),
});

/* ================= MOBILE ================= */
export const mobileSchema = z.object({
  brand: z.string().trim().min(1, "Brand is required"),
  imeiNumber: z.string().trim().min(1, "IMEI is required"),
  accessories: z.array(z.string()).default([]),
});

/* ================= CONSTANTS ================= */
export const DEPARTMENTS = [
  "Accounts",
  "Admin",
  "Audit",
  "Consultant",
  "F&B",
  "Front Office",
  "GST",
  "HR",
  "Housekeeping",
  "Kitchen",
  "Maintenance",
  "Operations",
  "Painter",
  "Purchase",
  "Sales",
  "Service",
  "Business Head",
  "Digital Marketing Manager",
  "Performance Marketing Executive",
  "Social Media Manager",
  "Graphic Designer",
  "SEO Executive",
  "Web Developer",
  "Operations Manager",
  "IT",
];

export const COMPANY = [
  "RKS MOTOR",
  "BROADDCAST BUSINESS SOLUTIONS",
  "VERAVITA",
  "AUTOZONE",
];

/* ================= ACCESSORIES ================= */
export const LAPTOP_ACCESSORIES = [
  "Mouse",
  "Keyboard",
  "Monitor",
  "Laptop Bag",
];

export const MOBILE_ACCESSORIES = [
  "Case/Cover",
  "Screen Protector",
  "Earbuds",
  "Charger",
  "Car Mount",
];

/* ================= TYPES ================= */
export type EmployeeData = z.infer<typeof employeeSchema>;
export type JobData = z.infer<typeof jobSchema>;
export type AssetSelectionData = z.infer<typeof assetSelectionSchema>;
export type LaptopData = z.infer<typeof laptopSchema>;
export type MobileData = z.infer<typeof mobileSchema>;

/* ================= FORM DATA ================= */
export interface FormData {
  employee: EmployeeData;
  job: JobData;
  selectedAssets: string[];
  assetDetails: {
    laptop?: LaptopData & { images?: string[] };
    mobile?: MobileData & { images?: string[] };
  };
  confirmed: boolean;
}

/* ================= INITIAL STATE ================= */
export const initialFormData: FormData = {
  employee: { fullName: "", number: "", employeeId: "" },
  job: { company: "", department: "", designation: "" },
  selectedAssets: [],
  assetDetails: {},
  confirmed: false,
};
