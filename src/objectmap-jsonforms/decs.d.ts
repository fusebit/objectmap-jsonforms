// Unfortunately this modules do not have @types so we have to do this

declare module '@jsonforms/react' {
  const withJsonFormsControlProps: any;
  const useJsonForms: any;
}

type JsonSchema = any;
type ControlProps = any;

declare module '@jsonforms/core' {
  const rankWith: any;
  const ControlProps: ControlProps;
  const JsonSchema: JsonSchema;
  const and: any;
  const uiTypeIs: any;
}
