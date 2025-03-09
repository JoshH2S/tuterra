
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";
import { motion } from "framer-motion";

interface SmartNotesPanelProps {
  notes: string[];
}

export const SmartNotesPanel = ({ notes }: SmartNotesPanelProps) => {
  if (notes.length === 0) {
    return (
      <Card className="sticky top-24 h-[600px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Smart Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-full items-center justify-center text-muted-foreground text-center p-4">
            <p>Notes will appear here as you chat with the tutor</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="sticky top-24 h-[600px] overflow-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          Smart Notes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notes.map((note, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-muted p-3 rounded-lg text-sm"
            >
              {note}
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
