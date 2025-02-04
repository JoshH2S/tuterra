import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ObjectiveInput } from "./ObjectiveInput";

interface Objective {
  description: string;
  days: number;
}

interface ObjectivesCardProps {
  objectives: Objective[];
  onObjectiveChange: (index: number, field: keyof Objective, value: string | number) => void;
  onAddObjective: () => void;
  onSubmit: () => void;
  isProcessing: boolean;
  isSubmitDisabled: boolean;
}

export const ObjectivesCard = ({
  objectives,
  onObjectiveChange,
  onAddObjective,
  onSubmit,
  isProcessing,
  isSubmitDisabled
}: ObjectivesCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Objectives</CardTitle>
        <CardDescription>Define learning objectives and their duration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {objectives.map((objective, index) => (
          <ObjectiveInput
            key={index}
            objective={objective}
            index={index}
            onChange={onObjectiveChange}
          />
        ))}
        
        <Button
          type="button"
          variant="outline"
          onClick={onAddObjective}
          className="w-full"
        >
          Add Another Objective
        </Button>

        <Button
          type="button"
          onClick={onSubmit}
          className="w-full"
          disabled={isSubmitDisabled}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Lesson Plan...
            </>
          ) : (
            'Generate Lesson Plan'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};