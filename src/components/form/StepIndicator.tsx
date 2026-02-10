import { Check } from "lucide-react";
import { useEffect, useState } from "react";

const STEPS = ["Employee", "Job Details", "Assets", "Details", "Review"];

interface StepIndicatorProps {
  currentStep: number;
  onStepClick?: (step: number) => void; // optional jump-back
}

const StepIndicator = ({ currentStep, onStepClick }: StepIndicatorProps) => {
  const totalSteps = STEPS.length;
  const progressPercent = ((currentStep - 1) / (totalSteps - 1)) * 100;

  const [scrolled, setScrolled] = useState(false);

  /* Sticky shadow on scroll */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`sticky top-0 z-30 transition-shadow bg-background ${
        scrolled ? "shadow-md dark:shadow-black/30" : ""
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 py-4">
        {/* ================= HEADER ================= */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-muted-foreground">
            Step <span className="text-primary">{currentStep}</span> of{" "}
            {totalSteps}
          </p>

          <p className="text-xs font-semibold text-primary">
            {Math.round(progressPercent)}%
          </p>
        </div>

        {/* ================= PROGRESS BAR ================= */}
        <div className="relative h-1.5 rounded-full bg-border overflow-hidden mb-5">
          <div
            className="absolute left-0 top-0 h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* ================= STEPS ================= */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex items-center justify-between min-w-[560px] sm:min-w-0">
            {STEPS.map((label, index) => {
              const stepNum = index + 1;
              const isComplete = currentStep > stepNum;
              const isActive = currentStep === stepNum;
              const isClickable = stepNum < currentStep;

              return (
                <div key={label} className="flex items-center flex-shrink-0">
                  <div className="flex flex-col items-center">
                    {/* Step circle */}
                    <button
                      type="button"
                      onClick={() =>
                        isClickable && onStepClick?.(stepNum)
                      }
                      disabled={!isClickable}
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300
                        ${
                          isComplete
                            ? "bg-primary text-white hover:scale-105"
                            : isActive
                            ? "bg-primary text-white shadow-lg scale-105"
                            : "bg-muted text-muted-foreground"
                        }
                        ${
                          isClickable
                            ? "cursor-pointer"
                            : "cursor-default"
                        }
                      `}
                    >
                      {isComplete ? <Check className="w-4 h-4" /> : stepNum}
                    </button>

                    {/* Label (desktop) */}
                    <span
                      className={`mt-2 text-xs font-medium hidden sm:block transition-colors
                        ${
                          isActive
                            ? "text-primary"
                            : isComplete
                            ? "text-primary/80"
                            : "text-muted-foreground"
                        }
                      `}
                    >
                      {label}
                    </span>

                    {/* Label (mobile only active) */}
                    {isActive && (
                      <span className="mt-2 text-xs font-medium sm:hidden text-primary">
                        {label}
                      </span>
                    )}
                  </div>

                  {/* Connector */}
                  {index < STEPS.length - 1 && (
                    <div
                      className={`w-10 sm:w-16 h-0.5 mx-2 transition-colors
                        ${
                          currentStep > stepNum
                            ? "bg-primary"
                            : "bg-border"
                        }
                      `}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepIndicator;
