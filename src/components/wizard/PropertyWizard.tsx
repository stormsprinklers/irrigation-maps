"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WIZARD_STEPS } from "@/lib/constants";
import { WizardShell } from "@/components/wizard/WizardShell";
import { StepProperty } from "@/components/wizard/steps/StepProperty";
import { StepZones } from "@/components/wizard/steps/StepZones";
import { StepConditions } from "@/components/wizard/steps/StepConditions";
import { StepIrrigation } from "@/components/wizard/steps/StepIrrigation";
import { StepEquipment } from "@/components/wizard/steps/StepEquipment";
import { StepReview } from "@/components/wizard/steps/StepReview";
import { Button } from "@/components/ui/button";
import type { PropertyWithRelations } from "@/types/database";

type PropertyWizardProps = {
  property: PropertyWithRelations;
};

export function PropertyWizard({ property: initialProperty }: PropertyWizardProps) {
  const router = useRouter();
  const [property, setProperty] = useState(initialProperty);
  const currentStep = property.wizard_step;
  const stepInfo = WIZARD_STEPS.find((s) => s.step === currentStep) ?? WIZARD_STEPS[0];

  useEffect(() => {
    setProperty(initialProperty);
  }, [initialProperty]);

  function refresh() {
    router.refresh();
  }

  function goToStep(step: number) {
    setProperty((p) => ({ ...p, wizard_step: step }));
  }

  return (
    <WizardShell
      currentStep={currentStep}
      title={stepInfo.title}
      description={stepInfo.description}
      footer={
        currentStep > 1 ? (
          <Button variant="outline" onClick={() => goToStep(currentStep - 1)}>
            Back
          </Button>
        ) : (
          <div />
        )
      }
    >
      {currentStep === 1 && (
        <StepProperty property={property} onComplete={() => goToStep(2)} />
      )}
      {currentStep === 2 && (
        <StepZones
          property={property}
          zones={property.zones}
          onComplete={() => {
            refresh();
            goToStep(3);
          }}
        />
      )}
      {currentStep === 3 && (
        <StepConditions
          propertyId={property.id}
          zones={property.zones}
          onComplete={() => {
            refresh();
            goToStep(4);
          }}
        />
      )}
      {currentStep === 4 && (
        <StepIrrigation
          propertyId={property.id}
          zones={property.zones}
          onComplete={() => {
            refresh();
            goToStep(5);
          }}
        />
      )}
      {currentStep === 5 && (
        <StepEquipment
          property={property}
          zones={property.zones}
          valves={property.valves}
          controllers={property.controllers}
          onComplete={() => {
            refresh();
            goToStep(6);
          }}
        />
      )}
      {currentStep === 6 && <StepReview property={property} />}
    </WizardShell>
  );
}
