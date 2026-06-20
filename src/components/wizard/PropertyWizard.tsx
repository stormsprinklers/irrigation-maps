"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WIZARD_STEPS } from "@/lib/constants";
import { WizardShell } from "@/components/wizard/WizardShell";
import { BackgroundImageProvider } from "@/components/wizard/BackgroundImageGeneration";
import { PresentationImageBanner } from "@/components/wizard/PresentationImageBanner";
import { StepProperty } from "@/components/wizard/steps/StepProperty";
import { StepZones } from "@/components/wizard/steps/StepZones";
import { StepIrrigation } from "@/components/wizard/steps/StepIrrigation";
import { StepEquipment } from "@/components/wizard/steps/StepEquipment";
import { StepReview } from "@/components/wizard/steps/StepReview";
import { Button } from "@/components/ui/button";
import type { PropertyWithRelations } from "@/types/database";

type PropertyWizardProps = {
  property: PropertyWithRelations;
};

function PropertyWizardContent({ property: initialProperty }: PropertyWizardProps) {
  const router = useRouter();
  const [property, setProperty] = useState(initialProperty);
  const currentStep = Math.min(property.wizard_step, WIZARD_STEPS.length);
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
      <PresentationImageBanner />
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
        <StepIrrigation
          propertyId={property.id}
          zones={property.zones}
          onComplete={() => {
            refresh();
            goToStep(4);
          }}
        />
      )}
      {currentStep === 4 && (
        <StepEquipment
          property={property}
          zones={property.zones}
          valves={property.valves}
          controllers={property.controllers}
          onComplete={() => {
            refresh();
            goToStep(5);
          }}
        />
      )}
      {currentStep === 5 && <StepReview property={property} />}
    </WizardShell>
  );
}

export function PropertyWizard({ property }: PropertyWizardProps) {
  return (
    <BackgroundImageProvider
      propertyId={property.id}
      initialImageUrl={property.stylized_image_url}
      initialBounds={property.map_bounds}
    >
      <PropertyWizardContent property={property} />
    </BackgroundImageProvider>
  );
}
