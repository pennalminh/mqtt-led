/* eslint-disable no-case-declarations */
/* eslint-disable indent */
import logger from "../utils/logger.js";
import {
  DisplayCommunicator,
  CandidateDevice,
} from "../DisplayCommunicator.js";
import DisplayDevice from "../DisplayDevice.js";

import { Program } from "../ProgramPlanner/Program.js";
import TextComponent from "../ProgramPlanner/TextComponent.js";
import ImageComponent from "../ProgramPlanner/ImageComponent.js";
import VideoComponent from "../ProgramPlanner/VideoComponent.js";
import ParkingSpacesComponent from "../ProgramPlanner/ParkingSpacesComponent.js";
import { faker } from "@faker-js/faker";

import readline from "readline";
import MqttService from "./mqtt.js";

async function main() {
  let card: DisplayDevice = null;
  if (card) {
    await card.deinit();
  }

  // Add thông tin vào đây
  card = new DisplayDevice("192.168.6.1", 10001);
  try {
    await card.init();
  } catch (e) {
    logger.error(e);
    process.exit(-1);
  }

  card.on("uploadProgress", (p) => {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(`Progress: ${p}\r`);
  });

  const mqttService = new MqttService(
    "mqtt://45.252.249.222:1883",
    "cw/led/CW001"
  );

  const client = mqttService.getClient();
  const program = new Program();

  program.addComponent(
    "led",
    new TextComponent(0, 0, 96, 32, 255, "Fixed_9x18B", "Hello world")
  );

  try {
    try {
      await card.addProgram(program);
    } catch (error) {
      if (error.message.includes("BUSY")) {
        logger.error(`Error: ${error.message} - Retry operation`);
        setTimeout(async () => {
          try {
            await card.addProgram(program);
          } catch (retryError) {
            logger.error(`Retry failed: ${retryError}`);
          }
        }, 5000);
      } else {
        throw error;
      }
    }
  } catch (e) {
    logger.error(e.toString());
  }

  client.on("message", (topic, message) => {
    const data = JSON.parse(message.toString());

    let obj = {
      text: "",
      color: "",
      justify: "center",
      blingSymbol: "",
      size: 16,
    };

    switch (data["status"]) {
      case "1":
        obj.text = "MỜI VÀO";
        obj.color = "#ffff00";
        obj.size = 20;
        break;
      case "2":
        obj.text = "↓ LÙI";
        obj.color = "#ffff00";
        obj.size = 22;
        break;
      case "3":
        obj.text = "↓ LÙI";
        obj.color = "#ffff00";
        obj.size = 22;
        break;
      case "4":
        obj.text = "↑ TIẾN";
        obj.color = "#ff0000";
        obj.size = 22;
        break;
      case "5":
        obj.text = "X DỪNG";
        obj.color = "#7df300";
        obj.size = 22;
        break;
      case "6":
        obj.text = "XÁC NHẬN RỬA";
        obj.color = "#7df300";
        obj.size = 18;
        break;
      case "7":
        obj.text = "ĐANG RỬA";
        obj.color = "#7df300";
        obj.size = 16;
        break;
      case "8":
        obj.text = "ĐÃ XONG √";
        obj.color = "#7df300";
        obj.size = 18;
        break;
      case "9":
        obj.text = "MỜI RA";
        obj.color = "#ffff00";
        obj.size = 22;
        break;
      case "10":
        obj.text = "MỜI RA";
        obj.color = "#ff0000";
        obj.size = 22;
        break;
      case "11":
        obj.text = "XIN CHÀO";
        obj.color = "#7df300";
        obj.size = 22;
        break;
      case "12":
        obj.text = "BẢO TRÌ";
        obj.color = "#ffff00";
        obj.size = 22;
        break;
      default:
        console.log("Invalid option. Please select a number between 1 and 10.");
    }

    (program.components["led"] as TextComponent).setText(obj.text);
    (program.components["led"] as TextComponent).setBlingSymbol(
      obj.blingSymbol
    );
    (program.components["led"] as TextComponent).setColor(obj.color);
    (program.components["led"] as TextComponent).setJustify(obj.justify);
    (program.components["led"] as TextComponent).setSizeText(obj.size);
    card.updateProgram(program);
  });
}

main();
