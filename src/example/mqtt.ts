import mqtt, { MqttClient } from "mqtt";

class MqttService {
  private client: MqttClient;
  private brokerUrl: string;
  private topic: string;

  constructor(brokerUrl: string, topic: string) {
    this.brokerUrl = brokerUrl;
    this.topic = topic;
    this.client = mqtt.connect(this.brokerUrl, {
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD,
    });

    this.initialize();
  }

  private initialize(): void {
    this.client.on("connect", () => this.onConnect());
    this.client.on("error", (err) => console.error("❌ MQTT Error:", err));
    this.client.on("close", () =>
      console.log("🔴 Disconnected from MQTT broker")
    );
    this.client.on("reconnect", () => console.log("♻️ Reconnecting..."));
  }

  private onConnect(): void {
    console.log("✅ Connected to MQTT broker");

    // Subscribe to the topic
    this.client.subscribe(this.topic, (err) => {
      if (!err) {
        console.log(`📩 Subscribed to topic: ${this.topic}`);
      } else {
        console.error("❌ Subscription error:", err.message);
      }
    });
  }

  public onMessage(topic: string, message: Buffer): void {
    console.log(`📨 Received message on ${topic}: ${message.toString()}`);
  }

  public publish(message: string): void {
    this.client.publish(this.topic, message, { qos: 1 });
  }

  public disconnect(): void {
    this.client.end(() => {
      console.log("👋 Gracefully disconnected from MQTT broker");
    });
  }

  public getClient(): MqttClient {
    return this.client;
  }
}

export default MqttService;
