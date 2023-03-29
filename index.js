const express = require('express');
const cors = require('cors');
const Emitter = require('events');

const config = require('./config/config');
const Environment = require('./config/environment');
const AWS = require('./lib/aws');

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "Access-Control-Allow-Methods",
        "Access-Control-Allow-Origin",
        "Access-Control-Allow-Headers",
        "Accept",
    ],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
Environment.setup();

app.get('/', (req, res) => {
    res.send('Hello World!');
});

const emitter = new Emitter();

app.post('/api/v1/image', async (req, res) => {
    const { story } = req.body;

    if (!story) {
        res.status(400).send({
            message: 'Story is required',
        });
        return;
    }

    try {
        const response = await AWS.sendQueueMessage(
            config.IMAGE_OUTGOING_MESSAGE_QUEUE_NAME,
            JSON.stringify(story)
        );
        res.send(response);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: 'Internal server error',
        });
    }
});

app.post('/api/v1/audio', async (req, res) => {
    const { story } = req.body;

    if (!story) {
        res.status(400).send({
            message: 'Story is required',
        });
        return;
    }

    try {
        const response = await AWS.sendQueueMessage(
            config.AUDIO_OUTGOING_MESSAGE_QUEUE_NAME,
            JSON.stringify(story)
        );
        res.send(response);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: 'Internal server error',
        });
    }
});

app.get('/api/v1/image-stream', async (req, res) => {

    res.setHeader('Content-Type', 'text/event-stream');
    emitter.on('images_received', (data) => {
        console.log(data);
        res.write(`data: ${data}\n\n`);
    });

    const imageStreamConsumer = AWS.createConsumer(
        config.IMAGE_INCOMING_MESSAGE_QUEUE_NAME,
        async (message) => {
            try {
                const { Body: data, ReceiptHandle } = message;

                // console.log(data);
                emitter.emit('images_received', data);

                await AWS.deleteMessage(
                    config.IMAGE_INCOMING_MESSAGE_QUEUE_NAME,
                    ReceiptHandle
                );
            } catch (error) {
                console.log(error);
            }
        }
    );

    imageStreamConsumer.start();

    imageStreamConsumer.on('error', (error) => {
        console.log(error);
    });

    imageStreamConsumer.on('processing_error', (error) => {
        console.log(error);
    });
});

app.get('/api/v1/audio-stream', async (req, res) => {
    
    res.setHeader('Content-Type', 'text/event-stream');
    emitter.on('audio_received', (data) => {
        console.log(data);
        res.write(`data: ${data}\n\n`);
    });

    const audioStreamConsumer = AWS.createConsumer(
        config.AUDIO_INCOMING_MESSAGE_QUEUE_NAME,
        async (message) => {
            try {
                const { Body: data, ReceiptHandle } = message;

                // console.log(data);
                emitter.emit('audio_received', data);

                await AWS.deleteMessage(
                    config.AUDIO_INCOMING_MESSAGE_QUEUE_NAME,
                    ReceiptHandle
                );
            } catch (error) {
                console.log(error);
            }
        }
    );

    audioStreamConsumer.start();

    audioStreamConsumer.on('error', (error) => {
        console.log(error);
    });

    audioStreamConsumer.on('processing_error', (error) => {
        console.log(error);
    });
});

app.listen(config.SERVER_PORT, () => {
    console.log(`Server running on port ${config.SERVER_PORT}`);
});