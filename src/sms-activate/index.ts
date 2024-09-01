const smsActivateApi = require("./api.ts");

export const checkPhoneNumberStatus = async (id: string) => {
  console.log("Checking phone number id status...", id);
  const timeout = 3 * 60 * 1000; // 3 minutes in milliseconds
  const interval = 5000; // 10 seconds interval between checks
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      const responseText = await smsActivateApi.getPhoneNumberStatus(id);

      if (responseText.includes("STATUS_OK")) {
        console.log("Phone number status is OK.");
        const [_, code] = responseText.split(':');
        return code;
      }
    } catch (error) {
      console.error("Failed to get phone number status:", error);
    }

    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error("Timeout: Phone number status did not become OK within 3 minutes.");
};

module.exports = {checkPhoneNumberStatus};
