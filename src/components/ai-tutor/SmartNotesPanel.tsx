
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";
import { motion } from "framer-motion";
import { cleanMarkdownFormatting } from "@/utils/markdown-cleaner";

interface SmartNotesPanelProps {
  notes: string[];
}

export const SmartNotesPanel = ({ notes }: SmartNotesPanelProps) => {
  if (notes.length === 0) {
    return (
      <Card className="sticky top-4 h-full overflow-hidden border bg-background/50 backdrop-blur-sm">
        <CardHeader className="border-b bg-muted/30 pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Smart Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex h-[500px] items-center justify-center text-muted-foreground text-center p-4">
            <p className="text-sm">Notes will appear here as you chat with the tutor</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="sticky top-4 h-full overflow-hidden border bg-background/50 backdrop-blur-sm">
      <CardHeader className="border-b bg-muted/30 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          Smart Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[500px] overflow-auto p-4 space-y-3">
          {notes.map((note, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-muted/50 p-3 rounded-lg text-sm border border-border/50"
            >
              {cleanMarkdownFormatting(note)}
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
