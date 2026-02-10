import { useState } from "react";
import { FormData } from "@/lib/formSchema";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Send,
  User,
  Briefcase,
  Package,
  Building2,
  Image as ImageIcon,
} from "lucide-react";

interface PreviewSubmitProps {
  data: FormData;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
}

const PreviewSubmit = ({
  data,
  onBack,
  onSubmit,
  submitting,
}: PreviewSubmitProps) => {
  const [confirmed, setConfirmed] = useState(true);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Review & Submit</h2>
        <p className="text-muted-foreground mt-1">
          Verify all details before submitting
        </p>
      </div>

      {/* ================= EMPLOYEE ================= */}
      <div className="rounded-lg border p-5 space-y-3">
        <h3 className="font-semibold flex items-center gap-2">
          <User className="w-4 h-4 text-primary" /> Employee
        </h3>

        <div className="grid sm:grid-cols-3 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Name:</span>{" "}
            <strong>{data.employee.fullName}</strong>
          </div>
          <div>
            <span className="text-muted-foreground">Mobile:</span>{" "}
            <strong>{data.employee.number}</strong>
          </div>
          <div>
            <span className="text-muted-foreground">Employee ID:</span>{" "}
            <strong>{data.employee.employeeId}</strong>
          </div>
        </div>
      </div>

      {/* ================= JOB ================= */}
      <div className="rounded-lg border p-5 space-y-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-primary" /> Job Details
        </h3>

        <div className="grid sm:grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            <span>
              <span className="text-muted-foreground">Company:</span>{" "}
              <strong>{data.job.company}</strong>
            </span>
          </div>

          <div>
            <span className="text-muted-foreground">Department:</span>{" "}
            <strong>{data.job.department}</strong>
          </div>

          <div>
            <span className="text-muted-foreground">Designation:</span>{" "}
            <strong>{data.job.designation}</strong>
          </div>
        </div>
      </div>

      {/* ================= ASSETS ================= */}
      <div className="rounded-lg border p-5 space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Package className="w-4 h-4 text-primary" /> Assigned Assets
        </h3>

        {Object.entries(data.assetDetails).length === 0 && (
          <p className="text-sm text-muted-foreground">
            No assets selected
          </p>
        )}

        {Object.entries(data.assetDetails).map(([assetName, asset]) => (
          <AssetPreview
            key={assetName}
            title={assetName}
            asset={asset as any}
          />
        ))}
      </div>

      {/* ================= CONFIRM ================= */}
      <label className="flex items-start gap-3 p-4 rounded-lg border cursor-pointer hover:bg-muted/50">
        <Checkbox
          checked={confirmed}
          onCheckedChange={(v) => setConfirmed(v === true)}
          className="mt-0.5"
        />
        <span className="text-sm font-medium">
          I confirm all information is correct and accurate.
        </span>
      </label>

      {/* ================= ACTIONS ================= */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button onClick={onSubmit} disabled={!confirmed || submitting}>
          {submitting ? "Submitting..." : "Submit"}
          <Send className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default PreviewSubmit;

/* ================= ASSET PREVIEW ================= */

const AssetPreview = ({
  title,
  asset,
}: {
  title: string;
  asset: Record<string, any>;
}) => {
  const { images, accessories, ...rest } = asset || {};

  return (
    <div className="bg-muted rounded-md p-4 space-y-3">
      <p className="font-medium">{title}</p>

      {/* TEXT DETAILS */}
      {Object.entries(rest).map(([key, value]) => (
        <p key={key} className="text-sm">
          <span className="capitalize text-muted-foreground">
            {key.replace(/([A-Z])/g, " $1")}:
          </span>{" "}
          <strong>{String(value)}</strong>
        </p>
      ))}

      {/* ACCESSORIES */}
      {Array.isArray(accessories) && accessories.length > 0 && (
        <p className="text-sm">
          <span className="text-muted-foreground">Accessories:</span>{" "}
          <strong>{accessories.join(", ")}</strong>
        </p>
      )}

      {/* IMAGES PREVIEW */}
      {Array.isArray(images) && images.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-primary" /> Images
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map((url: string, i: number) => (
              <img
                key={i}
                src={url}
                alt={`${title} ${i + 1}`}
                className="h-24 w-full object-cover rounded-md border"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
