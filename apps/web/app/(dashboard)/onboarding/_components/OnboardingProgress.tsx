interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
  return (
    <div
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-valuenow={currentStep}
      aria-label={`Passo ${currentStep} de ${totalSteps}`}
      className="flex flex-col items-center gap-3"
    >
      <div className="flex items-center gap-2">
        {Array.from({ length: totalSteps }, (_, idx) => {
          const stepNumber = idx + 1;
          const isCurrent = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          if (isCurrent) {
            return (
              <span
                key={stepNumber}
                className="bg-nox-accent ring-nox-accent/30 h-3 w-3 rounded-full ring-2 transition-all"
              />
            );
          }

          return (
            <span
              key={stepNumber}
              className={`h-2 w-2 rounded-full transition-colors ${
                isCompleted ? 'bg-nox-accent' : 'bg-nox-border'
              }`}
            />
          );
        })}
      </div>
      <p className="text-caption text-nox-txt3">
        Passo {currentStep} de {totalSteps}
      </p>
    </div>
  );
}
