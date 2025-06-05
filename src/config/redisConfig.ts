import { createClient } from "redis";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";

interface IKey {
    redis: {
        host: string;
        port: number;
        password: string;
    };
}

const configPath = path.join(
    process.cwd(),
    "node_modules",
    "my-config-repo",
    "key.yaml"
);
const config = yaml.load(fs.readFileSync(configPath, "utf8")) as IKey;

export const redisClient = createClient({
    socket: {
        host: config.redis.host,
        port: config.redis.port,
    },
    password: config.redis.password,
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));

(async () => {
    await redisClient.connect();
    console.log("Connected to Redis >");
})();

module.exports = {
    redisClient,
};
