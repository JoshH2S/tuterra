
import { useState } from "react";
import { Objective } from "@/types/lesson";

export const useObjectives = () => {
  const [objectives, setObjectives] = useState<Objective[]>([{ description: "", days: 1 }]);

  const addObjective = () => {
    setObjectives([...objectives, { description: "", days: 1 }]);
  };

  const updateObjective = (index: number, field: keyof Objective, value: string | number) => {
    const newObjectives = [...objectives];
    newObjectives[index] = {
      ...newObjectives[index],
      [field]: value
    };
    setObjectives(newObjectives);
  };

  const validateObjectives = () => {
    return !objectives.some(obj => !obj.description);
  };

  return {
    objectives,
    addObjective,
    updateObjective,
    validateObjectives,
  };
};
