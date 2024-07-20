export type FieldsError = {
  [field: string]: string[];
};

export interface ValidatorFields<PropsValidated> {
  errors: FieldsError;
  validateData: PropsValidated;
  validate(data: any): boolean;
}
