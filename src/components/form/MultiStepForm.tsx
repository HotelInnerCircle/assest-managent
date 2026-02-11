import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  FormData,
  initialFormData,
  EmployeeData,
  JobData,
  LaptopData,
  MobileData,
} from '@/lib/formSchema';

import StepIndicator from '@/components/form/StepIndicator';
import EmployeeDetails from '@/components/form/EmployeeDetails';
import JobDetails from '@/components/form/JobDetails';
import AssetSelection from '@/components/form/AssetSelection';
import AssetDetails from '@/components/form/AssetDetails';
import PreviewSubmit from '@/components/form/PreviewSubmit';

import { toast } from '@/hooks/use-toast';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MultiStepForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  /* ================= HANDLERS ================= */

  const handleEmployeeNext = (data: EmployeeData) => {
    setFormData((prev) => ({ ...prev, employee: data }));
    setStep(2);
  };

  const handleJobNext = (data: JobData) => {
    setFormData((prev) => ({ ...prev, job: data }));
    setStep(3);
  };

  const handleAssetNext = (selected: string[]) => {
    setFormData((prev) => ({ ...prev, selectedAssets: selected }));
    setStep(4);
  };

  const handleDetailsNext = (details: {
    laptop?: LaptopData & { images?: string[] };
    mobile?: MobileData & { images?: string[] };
  }) => {
    setFormData((prev) => ({ ...prev, assetDetails: details }));
    setStep(5);
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      const { error } = await supabase.from('submissions').insert({
        employee_name: formData.employee.fullName,
        employee_id: formData.employee.employeeId,
        employee_number: formData.employee.number,
        company: formData.job.company,
        department: formData.job.department,
        designation: formData.job.designation,
        selected_assets: formData.selectedAssets,
        asset_details: formData.assetDetails,
        confirmed: true,
      });

      if (error) throw error;

      setSuccess(true);
      toast({
        title: 'Success!',
        description: 'Asset details submitted successfully.',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Submission failed',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setStep(1);
    setSuccess(false);
  };

  /* ================= SUCCESS SCREEN ================= */

  if (success) {
    return (
      <div className='min-h-screen flex items-center justify-center px-4 bg-background'>
        <div className='w-full max-w-md bg-card border rounded-xl p-8 text-center space-y-6 shadow-lg animate-fade-in'>
          <div className='mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center'>
            <CheckCircle2 className='w-10 h-10 text-primary' />
          </div>

          <h1 className='text-2xl sm:text-3xl font-bold'>Submitted!</h1>

          <p className='text-sm sm:text-base text-muted-foreground'>
            Asset details have been submitted successfully. Our admin team will
            review the submission.
          </p>

          <Button
            onClick={handleReset}
            variant='outline'
            className='w-full sm:w-auto gap-2'
          >
            <RotateCcw className='w-4 h-4' /> Submit Another
          </Button>
        </div>
      </div>
    );
  }

  /* ================= FORM ================= */

  return (
    <div className='min-h-screen bg-background'>
      <div className='max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10'>
        {/* Sticky step indicator on mobile */}
        <div className='sticky top-0 z-10 bg-background pb-4'>
          <StepIndicator currentStep={step} />
        </div>

        <div className='mt-6 bg-card border rounded-xl p-5 sm:p-8 shadow-md'>
          {step === 1 && (
            <EmployeeDetails
              data={formData.employee}
              onNext={handleEmployeeNext}
            />
          )}

          {step === 2 && (
            <JobDetails
              data={formData.job}
              onNext={handleJobNext}
              onBack={() => setStep(1)}
            />
          )}

          {step === 3 && (
            <AssetSelection
              selected={formData.selectedAssets}
              onNext={handleAssetNext}
              onBack={() => setStep(2)}
            />
          )}

          {step === 4 && (
            <AssetDetails
              selectedAssets={formData.selectedAssets}
              assetDetails={formData.assetDetails}
              onNext={handleDetailsNext}
              onBack={() => setStep(3)}
            />
          )}

          {step === 5 && (
            <PreviewSubmit
              data={formData}
              onBack={() => setStep(4)}
              onSubmit={handleSubmit}
              submitting={submitting}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MultiStepForm;
