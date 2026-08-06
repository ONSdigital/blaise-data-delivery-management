type StepFn = () => void | Promise<void>;

export type NativeStep = (name: string, fn: () => unknown) => void;

type ScenarioStep = {
  kind: "Given" | "When" | "Then";
  name: string;
  fn: StepFn;
};

function withStepContext(error: unknown, description: string): Error {
  if (error instanceof Error) {
    error.message = `${description}\n${error.message}`;

    return error;
  }

  return new Error(`${description}\n${String(error)}`);
}

export function createScenario() {
  return (
    name: string,
    defineSteps: (steps: { Given: NativeStep; When: NativeStep; Then: NativeStep }) => void,
  ): void => {
    describe.sequential(`Scenario: ${name}`, () => {
      const steps: ScenarioStep[] = [];

      const mkStep = (kind: "Given" | "When" | "Then"): NativeStep => {
        return (stepName, stepFn) => {
          steps.push({ kind, name: stepName, fn: stepFn as StepFn });
        };
      };

      defineSteps({ Given: mkStep("Given"), When: mkStep("When"), Then: mkStep("Then") });

      test(`Scenario: ${name}`, async () => {
        for (const step of steps) {
          const description = `${step.kind} ${step.name}`;

          try {
            await step.fn();
          } catch (error) {
            throw withStepContext(error, description);
          }
        }
      });
    });
  };
}
