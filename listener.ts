import amqp from "amqplib";
import axios from "axios";

const queue = "car_created";
const webhookUrl = "http://api-test.bhut.com.br:3000/api/cars";

(async () => {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    process.once("SIGINT", async () => {
      await channel.close();
      await connection.close();
    });

    await channel.assertQueue(queue, { durable: false });
    await channel.consume(
      queue,
      async (message) => {
        if (message) {
          const data = JSON.parse(message.content.toString());
          console.log(" [x] Received '%s'", data);

          try {
            // Envia o payload como uma requisição POST para o webhook
            await axios.post(webhookUrl, data);
            console.log(" [x] Webhook sent successfully.");
          } catch (error) {
            console.error(" [x] Error sending webhook:", error);
          }
        }
      },
      { noAck: true }
    );
  } catch (err) {
    console.warn(err);
  }
})();
