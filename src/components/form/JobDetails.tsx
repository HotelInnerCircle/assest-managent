import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  jobSchema,
  JobData,
  DEPARTMENTS,
  COMPANY,
} from "@/lib/formSchema";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Building2,
  Briefcase,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

interface JobDetailsProps {
  data: JobData;
  onNext: (data: JobData) => void;
  onBack: () => void;
}

const JobDetails = ({ data, onNext, onBack }: JobDetailsProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<JobData>({
    resolver: zodResolver(jobSchema),
    defaultValues: data,
  });

  const company = watch("company") ?? "";
  const department = watch("department") ?? "";

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Job Details</h2>
        <p className="text-muted-foreground mt-1">
          Your role information
        </p>
      </div>

      <div className="space-y-4">
        {/* Company */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            Company
          </Label>

          <Select
            value={company}
            onValueChange={(val) =>
              setValue("company", val, { shouldValidate: true })
            }
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select Company" />
            </SelectTrigger>
            <SelectContent>
              {COMPANY.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {errors.company && (
            <p className="text-sm text-destructive">
              {errors.company.message}
            </p>
          )}
        </div>

        {/* Department */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            Department
          </Label>

          <Select
            value={department}
            onValueChange={(val) =>
              setValue("department", val, { shouldValidate: true })
            }
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select Department" />
            </SelectTrigger>
            <SelectContent>
              {DEPARTMENTS.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {errors.department && (
            <p className="text-sm text-destructive">
              {errors.department.message}
            </p>
          )}
        </div>

        {/* Designation */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-primary" />
            Designation
          </Label>

          <Input
            placeholder="Software Engineer"
            {...register("designation")}
            className="h-11"
          />

          {errors.designation && (
            <p className="text-sm text-destructive">
              {errors.designation.message}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <Button type="submit">
          Next <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </form>
  );
};

export default JobDetails;
