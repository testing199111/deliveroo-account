.env

PREFIX=
FIRST_NAME=
LAST_NAME=
COUPON_CODE=
SMS_API_KEY=
SMS_SERVICE=zk
SMS_COUNTRY=52
SMS_MAX_PRICE=20
SLACK_SEND=false
SLACK_TOKEN=
SLACK_CHANNEL_ID=
CONSOLE_LOG=false
CREATE_ADDRESS=false
APARTMENT_AND_FLOOR_NUMBER=
BLOCK=
BUILDING_HOUSE_NAME=
STREET_NUMBER=
STREET_NAME=
DISTRICT=
COORDINATES_X=
COORDINATES_Y=

---------------------------------

連結slack

開個app: https://docs.celigo.com/hc/en-us/articles/7140655476507-How-to-create-an-app-and-retrieve-OAuth-token-in-Slack
開權比app send野入app： https://stackoverflow.com/a/67674145
SLACK_SEND=true
SLACK_TOKEN= APP既OAuth & Permissions > Bot User OAuth Token
SLACK_CHANNEL_ID=係slack開返個app 睇detail會搵到Channel ID

ADDRESS_DATA: copy addresses?market=hk 個payload data 入field
