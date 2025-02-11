
import { useTemplateCrud } from "./useTemplateCrud";
import { useTemplateImportExport } from "./useTemplateImportExport";
import { useEffect } from "react";

export const useCourseTemplates = () => {
  const { 
    templates, 
    isLoading, 
    createTemplate, 
    deleteTemplate, 
    fetchTemplates 
  } = useTemplateCrud();

  const { 
    exportTemplate, 
    importTemplate 
  } = useTemplateImportExport(fetchTemplates);

  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates,
    isLoading,
    createTemplate,
    deleteTemplate,
    exportTemplate,
    importTemplate,
  };
};
