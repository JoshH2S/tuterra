# Resource Guidance System - Example

## Before (Specific Links - Problematic)
```json
{
  "resources": [
    {
      "title": "Financial Statement Analysis Guide",
      "description": "Comprehensive guide to analyzing financial statements",
      "url": "https://forbes.com/sites/advisor/2023/05/15/how-to-analyze-financial-statements"
    }
  ]
}
```

**Problems:**
- Link may break or become outdated
- Specific article may be removed or moved
- Students become dependent on exact resources

## After (Search Guidance - Better)
```json
{
  "resources": [
    {
      "title": "Financial Statement Analysis Guide",
      "description": "Learn how to analyze balance sheets, income statements, and cash flow statements",
      "search_guidance": "Search Forbes.com for articles about 'financial statement analysis' or 'how to read financial statements'. Look for recent articles (within last 2 years) that cover ratio analysis and trend analysis.",
      "website": "https://forbes.com"
    },
    {
      "title": "Excel Financial Modeling Tutorials",
      "description": "Step-by-step tutorials for building financial models in Excel",
      "search_guidance": "Search YouTube for 'Excel financial modeling tutorial' or 'DCF model Excel'. Look for channels like ExcelIsFun, Leila Gharani, or Corporate Finance Institute.",
      "website": "https://youtube.com"
    },
    {
      "title": "Industry Research Database",
      "description": "Access comprehensive industry reports and market data",
      "search_guidance": "Search your local library website for 'IBISWorld' or 'Statista' database access. Many public libraries provide free access to these premium research tools with a library card.",
      "website": "https://ibisworld.com"
    }
  ]
}
```

## UI Display

The new format will show:

**Resource Title**
Brief description of what this resource provides

💡 **How to find this resource:**
Search Forbes.com for articles about 'financial statement analysis' or 'how to read financial statements'. Look for recent articles (within last 2 years) that cover ratio analysis and trend analysis.

[Visit Website →]

## Benefits

1. **Future-proof**: Guidance remains valid even if specific articles change
2. **Educational**: Teaches students how to find information independently  
3. **Flexible**: Students can find multiple relevant resources, not just one
4. **Current**: Students will find recent, up-to-date information
5. **Sustainable**: No broken links or maintenance overhead

## Implementation

- ✅ Updated AI prompt in `generate-task-details` Edge Function
- ✅ Updated resource display in `TaskDetailsModal` component
- ✅ Backward compatibility maintained for existing tasks
- ✅ New tasks will use guidance-based approach
