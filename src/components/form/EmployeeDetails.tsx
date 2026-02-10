import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { employeeSchema, EmployeeData } from "@/lib/formSchema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, Mail, BadgeCheck, ArrowRight } from "lucide-react";

interface EmployeeDetailsProps {
  data: EmployeeData;
  onNext: (data: EmployeeData) => void;
}

const EmployeeDetails = ({ data, onNext }: EmployeeDetailsProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmployeeData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: data,
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Employee Details</h2>
        <p className="text-muted-foreground mt-1">Tell us about yourself</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="flex items-center gap-2">
            <User className="w-4 h-4 text-primary" /> Full Name
          </Label>
          <Input
            id="fullName"
            placeholder="John Doe"
            {...register("fullName")}
            className="h-11"
          />
          {errors.fullName && (
            <p className="text-sm text-destructive">{errors.fullName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" /> Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="john.doe@company.com"
            {...register("email")}
            className="h-11"
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="employeeId" className="flex items-center gap-2">
            <BadgeCheck className="w-4 h-4 text-primary" /> Employee ID
          </Label>
          <Input
            id="employeeId"
            placeholder="EMP-001"
            {...register("employeeId")}
            className="h-11"
          />
          {errors.employeeId && (
            <p className="text-sm text-destructive">{errors.employeeId.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" className="gap-2">
          Next <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
};

export default EmployeeDetails;
