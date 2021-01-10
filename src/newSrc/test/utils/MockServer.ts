import "reflect-metadata";
import {App} from "../../app";
import {Container} from "typedi";
import {MockRedisService} from "./MockRedisService";
import {RedisServiceToken} from "../../Services/RedisService";


export function getTestServer() {
    jest.mock("../../Services/NotificationService")
    Container.set(RedisServiceToken, new MockRedisService());
    return Container.get(App);
}

export function tearDownTestServer() {
    jest.unmock("../../Services/NotificationService")
}