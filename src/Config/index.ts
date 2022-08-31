import path from "path";
import { Config as mConfigDatabase } from "./../Interfaces/Config"
import {RulesCreateTable} from "../Interfaces/Class";

export const DatabaseMariaDB : mConfigDatabase = {
    engine : "PoolConnection",
    host : "127.0.0.1",
    user : "root",
    password : "",
    port : 3306,
    database : "test",
    connectionLimit : 100,
    idleTimeout : 1000,
    connectTimeout : 3000,
    autoBackup : {
        enabled : false,
        backupPriodic : "DAILY",
        filename : "DKAMariaDBBackup",
        extension : ".sql",
        forceReplace : false,
        dumpFileLocation : path.join(require.main?.filename!, "./../Backup/MariaDB"),
        compressFile : false
    }
}
export const CreateTableConfig : RulesCreateTable = {
    data : [],
    ifNotExist: false,
    engine : "innodb"
};
export default DatabaseMariaDB;