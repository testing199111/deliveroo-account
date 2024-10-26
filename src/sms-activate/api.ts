const dotenv = require("dotenv");
dotenv.config();

const apiKey = process.env.SMS_API_KEY;
const service = process.env.SMS_SERVICE;
const country = process.env.SMS_COUNTRY;
const maxPrice = process.env.SMS_MAX_PRICE || 20;

export const requestPhoneNumber = async () => {
  try {
    const response = await fetch(
      `https://api.sms-activate.io/stubs/handler_api.php?api_key=${apiKey}&action=getNumber&service=${service}&country=${country}&maxPrice=${maxPrice}`
    );
    const responseText = await response.text();
    const [status, id, phoneNumber] = responseText.split(':');
    if (status === "ACCESS_NUMBER") {
      console.log("Phone number data:", { id, phoneNumber });
      return { id, phoneNumber };
    } else {
      throw new Error(`Unexpected response status: ${status}`);
    }
  } catch (error) {
    throw new Error(`Failed to request phone number: ${error}`);
  }
};

export const getPhoneNumberStatus = async (id: string) => {
  try {
    const response = await fetch(
      `https://api.sms-activate.io/stubs/handler_api.php?api_key=${apiKey}&action=getStatus&id=${id}`
    );
    const responseText = await response.text();
    console.log("Phone number status:", responseText);
    return responseText;
  } catch (error) {
    throw new Error(`Failed to get phone number status: ${error}`);
  }
};

module.exports = {
  requestPhoneNumber,
  getPhoneNumberStatus,
};
