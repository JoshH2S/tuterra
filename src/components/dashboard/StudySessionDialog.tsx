
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreateStudySessionData } from "@/types/study-sessions";
import { SessionFormFields } from "./calendar/SessionFormFields";
import { useSessionForm } from "./calendar/useSessionForm";

interface StudySessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateSession: (sessionData: CreateStudySessionData) => Promise<void>;
}

export function StudySessionDialog({ 
  open, 
  onOpenChange, 
  onCreateSession
}: StudySessionDialogProps) {
  const {
    sessionData,
    setSessionData,
    selectedDate,
    setSelectedDate,
    courses,
    isLoading,
    handleSubmit,
    resetForm
  } = useSessionForm({
    onCreateSession,
    onClose: () => onOpenChange(false)
  });
  
  // Handle dialog close - reset form when closing
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm();
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] py-6">
        <h3 className="text-lg font-semibold mb-6">Schedule Study Session</h3>
        
        <form className="space-y-5" onSubmit={handleSubmit}>
          <SessionFormFields
            sessionData={sessionData}
            setSessionData={setSessionData}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            courses={courses}
            isLoading={isLoading}
          />
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Schedule Session</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
