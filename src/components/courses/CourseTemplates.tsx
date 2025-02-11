
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CourseTemplate } from "@/types/media";
import { useCourseTemplates } from "@/hooks/useCourseTemplates";
import { Upload, Download, Trash2, Import } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const CourseTemplates = () => {
  const [newTemplateTitle, setNewTemplateTitle] = useState("");
  const { templates, isLoading, createTemplate, deleteTemplate, exportTemplate, importTemplate } = useCourseTemplates();

  const handleCreateTemplate = async () => {
    if (newTemplateTitle.trim()) {
      const result = await createTemplate(newTemplateTitle, {});
      if (result) {
        setNewTemplateTitle("");
      }
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await importTemplate(file);
      event.target.value = ''; // Reset file input
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Templates</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Enter template title"
              value={newTemplateTitle}
              onChange={(e) => setNewTemplateTitle(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleCreateTemplate}
              disabled={!newTemplateTitle.trim()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Create Template
            </Button>
            <div className="relative">
              <Input
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
                id="template-import"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('template-import')?.click()}
              >
                <Import className="h-4 w-4 mr-2" />
                Import
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div>Loading templates...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template: CourseTemplate) => (
                <Card key={template.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{template.title}</h3>
                        {template.description && (
                          <p className="text-sm text-gray-500">{template.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => exportTemplate(template)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Template</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{template.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => deleteTemplate(template.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
