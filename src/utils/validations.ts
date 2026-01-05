export const validateLettersOnly = (value: string): boolean => {
  return /^[A-Za-zА-Яа-яЁёӨөҮү\s]*$/.test(value);
};

export const validateNumbersOnly = (value: string): boolean => {
  return /^[0-9]*$/.test(value);
};

export const validateNumbersWithDots = (value: string): boolean => {
  return /^[0-9.]*$/.test(value);
};

export const validateLettersAndPunctuation = (value: string): boolean => {
  return /^[A-Za-zА-Яа-яЁёӨөҮү\s.,;:!?\-\n()]*$/.test(value);
};

export const validateRegistrationNumber = (value: string): boolean => {
  const upperValue = value.toUpperCase();
  if (upperValue.length <= 2) {
    return /^[A-ZА-ЯЁӨҮү]*$/.test(upperValue);
  } else {
    const letters = upperValue.slice(0, 2);
    const numbers = upperValue.slice(2);
    return /^[A-ZА-ЯЁӨҮү]{2}$/.test(letters) && /^[0-9]*$/.test(numbers);
  }
};

export const capitalizeFirstLetter = (value: string): string => {
  if (value.length > 0) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
  return value;
};

export const formatRegistrationNumber = (value: string): string => {
  return value.toUpperCase();
};

