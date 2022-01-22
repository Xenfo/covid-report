import * as Yup from 'yup';

const CaseSchema = Yup.object().shape({
  caseIdOrRoomNumber: Yup.string()
    .required('Case ID or classroom number is required')
    .min(3, 'Must be a valid case ID or classroom number')
    .max(25, 'Must be a valid case ID or classroom number')
});

export default CaseSchema;
