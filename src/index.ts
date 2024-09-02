const slackUtils = require("./slack/index.ts");

const generateRandomString = require("./helper");
const smsActivateApi = require("./sms-activate/api");
const smsActivate = require("./sms-activate/index.ts");

// const puppeteer = require("puppeteer");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");
const UserAgent = require("user-agents");
const dotenv = require("dotenv");
dotenv.config();

const stealth = StealthPlugin();
// stealth.enabledEvasions.delete("iframe.contentWindow");
// stealth.enabledEvasions.delete("media.codecs");
// stealth.enabledEvasions.delete("user-agent-override");

puppeteer.use(stealth);
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

const connectionStatus = {
  sentVerificationCode: false,
  verifyCode: false,
  createAccount: false,
  redeemCoupon: false,
  recaptchaDetected: false,
};

const randomString = generateRandomString();

const accountDetails = {
  email: randomString,
  password: randomString,
  firstName: process.env.FIRST_NAME || "John",
  lastName: process.env.LAST_NAME || "Don",
  phoneNumberId: "",
  phoneNumber: "+",
  couponCode: process.env.COUPON_CODE || "NEW50HK",
};

console.log("Account details:", accountDetails);

const createAccount = async () => {
  console.log("Launching browser...");
  puppeteer
    .launch({
      headless: false,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      executablePath:
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      //https://github.com/berstend/puppeteer-extra/issues/908
      // If you use Windows, set here
      //   executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      // For linux
      //   executablePath: '/usr/bin/google-chrome',
    })
    .then(async (browser: any) => {
      let page;
      try {
        console.log("Browser launched.");

        page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
        console.log("New page opened.");

        page.on("response", async (response: any) => {
          // console.log("Response URL:", response.url());
          try {
            if (
              response
                .url()
                .includes("https://deliveroo.hk/send_verification_code")
            ) {
              console.log("send verification code");
              const status = response.status();
              console.log("Response status:", status);
              const responseBody = await response.json();
              console.log("Response body:", responseBody);
              if (status === 200) {
                connectionStatus.sentVerificationCode = true;
              }
            }

            if (response.url().includes("https://deliveroo.hk/verify_code")) {
              console.log("verify code response");
              const status = response.status();
              console.log("Response status:", status);
              const responseBody = await response.json();
              console.log("Response body:", responseBody);
              if (status === 200) {
                connectionStatus.verifyCode = true;
              }
            }

            if (
              response
                .url()
                .includes("https://api.hk.deliveroo.com/orderapp/v1/users")
            ) {
              console.log("create account response");
              const status = response.status();
              console.log("Response status:", status);
              // const responseBody = await response.json();
              console.log("Response body:", response);
              if (status === 200 || status === 201) {
                connectionStatus.createAccount = true;
              }
            }

            if (response.url().includes("vouchers")) {
              const voucherUrlPattern =
                /https:\/\/api\.hk\.deliveroo\.com\/orderapp\/v1\/users\/[^/]+\/vouchers/;
              if (!voucherUrlPattern.test(response.url())) return;
              console.log("voucher response", response.url());
              const status = response.status();
              console.log("Response status:", status);
              const responseBody = await response.json();
              console.log("Response body:", responseBody);
              if (status === 200 || status === 201) {
                connectionStatus.redeemCoupon = true;
              }
            }
          } catch (error) {
            console.error("Error:", error);
          }
        });

        const userAgent = new UserAgent().random().toString();
        await page.setUserAgent(userAgent);

        console.log("Navigating to Deliveroo login page...");
        await page.goto("https://deliveroo.hk/en/login", {
          waitUntil: "networkidle2",
        });
        console.log("Navigation complete.");

        // const content = await page.content();
        // console.log('Current page content:', content);

        await page.screenshot({
          path: "landing.png",
        });

        try {
          await page.waitForSelector("#continue-with-email", {
            timeout: 20000,
          });
          console.log("Next page loaded. (enter email)");
        } catch (error) {
          console.error("Next page did not load within the timeout period.");
        }

        // Wait for the "Continue with email" button to be available
        await new Promise((r) => setTimeout(r, 5000));

        console.log('Clicking "Continue with email" button...');
        await page.click("#continue-with-email");
        console.log('"Continue with email" button clicked.');

        await page.type("#email-address", accountDetails.email);
        console.log("Random email entered into the input field.");

        await page.click('button[type="submit"]');
        console.log('"Continue" button clicked.');

        try {
          await page.waitForSelector('input[name="phone_number"]', {
            timeout: 10000,
          });
          console.log("Next page loaded. (enter phone number)");
        } catch (error) {
          console.error("Next page did not load within the timeout period.");
        }

        // throw Error("Test Error");

        const phoneNumberData = await smsActivateApi.requestPhoneNumber();
        accountDetails.phoneNumberId = phoneNumberData.id;
        accountDetails.phoneNumber =
          accountDetails.phoneNumber + phoneNumberData.phoneNumber;

        const phoneInputField = await page.$('input[name="phone_number"]');
        // await phoneInputField.click({ clickCount: 4 });
        // await phoneInputField.type(String.fromCharCode(8)); // Clear the input field
        await page.evaluate(
          (input: any) => (input.value = ""),
          phoneInputField
        ); // Clear the input field
        await page.type(
          'input[name="phone_number"]',
          accountDetails.phoneNumber
        );

        console.log("Phone number entered into the input field.");

        await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll("button"));
          const sendVerificationButton = buttons.find((button) =>
            button?.textContent?.includes("Send verification code")
          );
          if (sendVerificationButton) {
            console.log('"Send verification code" button is enabled.');
            sendVerificationButton.click();
          }
        });
        console.log('"Send verification code" button clicked.');

        await new Promise((r) => setTimeout(r, 5000));

        if (connectionStatus.sentVerificationCode) {
          console.log("Verification code sent successfully.");
          // Proceed with the next steps
        } else {
          throw Error("Failed to send verification code.");
        }

        const smsCode = await smsActivate.checkPhoneNumberStatus(
          accountDetails.phoneNumberId
        );
        console.log("SMS code:", smsCode);
        // Wait for the text field to be available
        await page.waitForSelector('input[name="phone_code"]', {
          timeout: 10000,
        });

        // Type the SMS code into the text field
        await page.type('input[name="phone_code"]', smsCode);
        // await page.type('input[name="phone_code"]', "941220");
        console.log("SMS code entered into the text field.");

        await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll("button"));
          console.log("Buttons:", buttons);
          const verificationButton = buttons.find((button) =>
            button?.textContent?.includes("Verify")
          );
          console.log("Verification button:", verificationButton);
          if (!verificationButton) {
            throw Error("Verification button not found.");
          }
          console.log('"Verify" button is enabled.');
          verificationButton.click();
        });
        console.log('"Verify" button clicked.');

        await new Promise((r) => setTimeout(r, 6000));

        if (connectionStatus.verifyCode) {
          console.log("sms code verification successfully.");
          // Proceed with the next steps
        } else {
          throw Error("Failed to verify sms code.");
        }

        await page.type("#fullName", accountDetails.firstName);
        console.log("fullName entered into the input field.");

        await page.type("#preferredName", accountDetails.lastName);
        console.log("preferredName entered into the input field.");

        await page.type("#password", accountDetails.password);
        console.log("password entered into the input field.");

        await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll("button"));
          const CreateAccountButton = buttons.find((button) =>
            button?.textContent?.includes("Create account")
          );
          if (!CreateAccountButton) {
            throw Error("Create account button not found.");
          }
          console.log('"Create account" button is enabled.');
          CreateAccountButton.click();
        });

        console.log('"Create account" button clicked.');

        await new Promise((r) => setTimeout(r, 6000));

        if (connectionStatus.createAccount) {
          console.log("Created Account");
        } else {
          throw Error("Failed to create account.");
        }

        console.log("Account Details:", accountDetails);

        // ----------------------------------------------

        console.log("Navigating to Deliveroo redeem coupon page...");
        await page.goto("https://deliveroo.hk/en/account/vouchers", {
          waitUntil: "networkidle2",
        });
        console.log("Navigation complete.");

        await page.type("#voucher-code", accountDetails.couponCode);
        console.log(
          `coupon code ${accountDetails.couponCode} entered into the input field.`
        );

        await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll("button"));
          const SubmitButton = buttons.find((button) =>
            button?.textContent?.includes("Submit")
          );
          if (!SubmitButton) {
            throw Error("Submit button not found.");
          }
          console.log('"Submit" button is enabled.');
          SubmitButton.click();
        });

        console.log('"Submit account" button clicked.');

        await new Promise((r) => setTimeout(r, 5000));

        if (connectionStatus.redeemCoupon) {
          console.log("Redeem Coupon Successfully");
          if (process.env.SLACK_SEND === "true") {
            await slackUtils.sendfullAccountDetails(accountDetails);
            console.log("Account detail sent to slack");
          }
        } else {
          throw Error("Failed to redeem coupon.");
        }
      } catch (error) {
        throw Error(error as any);
      } finally {
        await page.screenshot({
          path: "final.png",
        });
        console.log("screenshot captured");
        await browser.close();
        console.log("Browser closed.");
      }
    });
};

createAccount();
