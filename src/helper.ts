export const generateRandomEmail = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  let email = '';
  for (let i = 0; i < 5; i++) {
    email += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${email}@gmail.com`;
};

module.exports = generateRandomEmail;