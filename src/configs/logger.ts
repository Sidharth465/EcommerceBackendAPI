import fs from "fs";
import path from "path";
import morgan from "morgan";
import config from "./index";

const logDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const accessLogStream = fs.createWriteStream(path.join(logDir, "access.log"), {
  flags: "a",
});

export const setupLogging = (app: any) => {
  if (config.nodeEnv === "production") {
    app.use(morgan("combined", { stream: accessLogStream }));
  } else {
    app.use(morgan("dev"));
    app.use(morgan("combined", { stream: accessLogStream }));
  }
};
