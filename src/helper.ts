import dayjs from 'dayjs';

export const generateRandomString = (): string => {
  const time = dayjs().format("MMDDHHmm");
  return `${process.env.PREFIX}${time}@gmail.com`;
};

module.exports = generateRandomString;