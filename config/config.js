const dotenv = require('dotenv');

dotenv.config();

 const config = {
    SERVER_PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION,
    AWS_QUEUE_URL: process.env.AWS_QUEUE_URL,
    AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME,
    AUDIO_INCOMING_MESSAGE_QUEUE_NAME: process.env.AUDIO_INCOMING_MESSAGE_QUEUE_NAME,
    AUDIO_OUTGOING_MESSAGE_QUEUE_NAME: process.env.AUDIO_OUTGOING_MESSAGE_QUEUE_NAME,
    IMAGE_INCOMING_MESSAGE_QUEUE_NAME: process.env.IMAGE_INCOMING_MESSAGE_QUEUE_NAME,
    IMAGE_OUTGOING_MESSAGE_QUEUE_NAME: process.env.IMAGE_OUTGOING_MESSAGE_QUEUE_NAME,
};

module.exports = config;