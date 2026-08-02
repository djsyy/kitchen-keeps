export const buildUpdatedFields = (body, allowedAttributes) => {
  const updatedValues = [];
  const updatedFields = [];

  allowedAttributes.forEach((attribute) => {
    if (Object.hasOwn(body, attribute)) {
      updatedValues.push(body[attribute]);
      updatedFields.push(`${attribute} = $${updatedValues.length}`);
    }
  });

  return { updatedValues, updatedFields };
};
