-- Create a function to get column information for a table
CREATE OR REPLACE FUNCTION public.pg_get_columns(
  table_name text,
  schema_name text DEFAULT 'public'
)
RETURNS TABLE (
  column_name text,
  data_type text,
  is_nullable boolean,
  column_default text
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY 
  SELECT 
    c.column_name::text, 
    c.data_type::text,
    (c.is_nullable = 'YES')::boolean as is_nullable,
    c.column_default::text
  FROM 
    information_schema.columns c
  WHERE 
    c.table_schema = schema_name
    AND c.table_name = table_name
  ORDER BY 
    c.ordinal_position;
END;
$$;

-- Grant execution privilege to authenticated users
GRANT EXECUTE ON FUNCTION public.pg_get_columns(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.pg_get_columns(text) TO authenticated; 