const dotenv = require("dotenv");
dotenv.config();
const { WebClient } = require('@slack/web-api');

const options = {};
const web = new WebClient(process.env.SLACK_TOKEN, options);


export const sendSlackMessage = async (text: string, block:any = null) => {
  console.log('Sending Slack message:');
  const channelId = process.env.SLACK_CHANNEL_ID;
  try {
    const resp = await web.chat.postMessage({
      text: text,
      channel: channelId,
      ...(block && { blocks: block })      
    });
    console.log("Slack message sent:", resp.ts);
  } catch (error) {
    console.error("Failed to send Slack message:", error);
  }
};

module.exports = { sendSlackMessage };
