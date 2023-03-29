const aws = require("aws-sdk");
const { SQSClient } = require("@aws-sdk/client-sqs");
const { Consumer } = require("sqs-consumer");
const config = require("../config/config");


class AWS {
    constructor() {
        aws.config.update({
            region: config.AWS_REGION,
            credentials: {
                accessKeyId: config.AWS_ACCESS_KEY_ID,
                secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
            },
        });

        this.sqsClient = new SQSClient({
            region: config.AWS_REGION,
            credentials: {
                accessKeyId: config.AWS_ACCESS_KEY_ID,
                secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
            },
        });
    }
  
    async listQueues(name) {
      const sqs = new aws.SQS();
      const params = {
        QueueNamePrefix: name,
      };
  
      try {
        const response = await sqs.listQueues(params).promise();
        return response;
      } catch (error) {
        console.log(error);
        throw error;
      }
    }
  
    async sendQueueMessage(name, message) {
      // const queues = await this.listQueues(name);
      // if (!queues.QueueUrls || queues.QueueUrls.length === 0) {
      //   throw new Error("Queue not found");
      // }
  
      const sqs = new aws.SQS();
      const queueUrl = config.AWS_QUEUE_URL + name;
      const params = {
        MessageBody: message,
        QueueUrl: queueUrl,
      };
  
      try {
        const response = await sqs.sendMessage(params).promise();
        return response;
      } catch (error) {
        console.log(error);
        throw error;
      }
    }

    createConsumer(name, handler) {
        const queueUrl = config.AWS_QUEUE_URL + name;
        const app = Consumer.create({
            queueUrl,
            handleMessage: async (message) => {
                try {
                    await handler(message);
                } catch (error) {
                    console.log(error);
                }
            },
            sqs: this.sqsClient,
        });
        return app;
    }

    async deleteMessage(name, receiptHandle) {
        // const queues = await this.listQueues(name);
        // if (!queues.QueueUrls || queues.QueueUrls.length === 0) {
        //     throw new Error("Queue not found");
        // }

        const sqs = new aws.SQS();
        const queueUrl = config.AWS_QUEUE_URL + name;
        const params = {
            QueueUrl: queueUrl,
            ReceiptHandle: receiptHandle,
        };

        try {
            const response = await sqs.deleteMessage(params).promise();
            return response;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}


module.exports = new AWS();