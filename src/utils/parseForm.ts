import { IncomingMessage } from 'http';
import formidable from 'formidable';
import IncomingForm from 'formidable/Formidable';

export const parseForm = async (
  form: IncomingForm,
  req: IncomingMessage,
): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  return await new Promise(async (resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
};
