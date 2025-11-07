// Mongolian and English letters validation
export const validateLettersOnly = (value: string): boolean => {
  return /^[A-Za-zА-Яа-яЁёӨөҮү\s]*$/.test(value);
};

// Numbers only validation
export const validateNumbersOnly = (value: string): boolean => {
  return /^[0-9]*$/.test(value);
};

// Numbers with dots validation (for dates)
export const validateNumbersWithDots = (value: string): boolean => {
  return /^[0-9.]*$/.test(value);
};

// Letters and punctuation validation
export const validateLettersAndPunctuation = (value: string): boolean => {
  return /^[A-Za-zА-Яа-яЁёӨөҮү\s.,;:!?\-\n()]*$/.test(value);
};

// Registration number validation (2 letters + 8 numbers)
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

// Capitalize first letter
export const capitalizeFirstLetter = (value: string): string => {
  if (value.length > 0) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
  return value;
};

// Format registration number to uppercase
export const formatRegistrationNumber = (value: string): string => {
  return value.toUpperCase();
};

