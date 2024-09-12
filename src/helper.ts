import dayjs from 'dayjs';

export const generateRandomString = (): string => {
  const time = dayjs().format("MMDDHHmm");
  return `${process.env.PREFIX}${time}@gmail.com`;
};

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
  generateRandomString,
  delay
};