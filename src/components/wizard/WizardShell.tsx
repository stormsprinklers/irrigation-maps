"use client";

import { WIZARD_STEPS } from "@/lib/constants";
import { Progress } from "@/components/ui/progress";

type WizardShellProps = {
  currentStep: number;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function WizardShell({
  currentStep,
  title,
  description,
  children,
  footer,
}: WizardShellProps) {
  const progress = (currentStep / WIZARD_STEPS.length) * 100;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {WIZARD_STEPS.map((step) => (
            <div
              key={step.step}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                step.step === currentStep
                  ? "bg-primary text-primary-foreground"
                  : step.step < currentStep
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {step.step}. {step.title}
            </div>
          ))}
        </div>
        <Progress value={progress} className="h-2" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && <p className="mt-1 text-muted-foreground">{description}</p>}
        </div>
      </div>
      <div className="rounded-xl border bg-card p-6 shadow-sm">{children}</div>
      {footer && <div className="flex items-center justify-between">{footer}</div>}
    </div>
  );
}
