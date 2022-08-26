import { Config as mConfigDatabase } from "./../Interfaces/Config"

export const DatabaseMariaDB : mConfigDatabase = {
    engine : "PoolConnection",
    host : "127.0.0.1",
    user : "root",
    password : "",
    port : 3306,
    database : "test",
    connectionLimit : 100
}

export default DatabaseMariaDB;