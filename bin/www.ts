import app, { db } from "../app.js";
import debugLib from "debug";
import http from "http";
import { type AddressInfo } from "net";

const debug = debugLib("blog-api:server");

const port = normalizePort(process.env.PORT || "5480");
app.set("port", port);

const server = http.createServer(app);

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

function normalizePort(val: string): number | string | false {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }

  if (port >= 0) {
    return port;
  }

  return false;
}

function onError(error: NodeJS.ErrnoException): never | void {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind =
    typeof port === "string"
      ? `Pipe ${port}`
      : `Port ${port}`;

  switch (error.code) {
    case "EACCES":
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);

    case "EADDRINUSE":
      console.error(`${bind} is already in use`);
      process.exit(1);

    default:
      throw error;
  }
}

function onListening(): void {
  const addr = server.address();

  const bind =
    typeof addr === "string"
      ? `pipe ${addr}`
      : `port ${(addr as AddressInfo).port}`;

  debug(`Listening on ${bind}`);
}

function gracefulShutdown(signal: any) {
  console.log(`Received ${signal}. Shutting down Express server...`);
  
  server.close(async () => {
    console.log('Express server closed.');

    await db.$pool.end()
    
    process.exit(0);
  });
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));