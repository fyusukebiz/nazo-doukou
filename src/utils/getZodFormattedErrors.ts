import { z } from 'zod';

export const getZodFormattedErrors = <T extends Record<string, unknown>>(
  validation: z.SafeParseError<T>,
): Record<string, string> => {
  return validation.error.issues.reduce((acc, curr) => ({ ...acc, [`${curr.path.join('.')}`]: curr.message }), {});
};
