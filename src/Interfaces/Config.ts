import { ConnectionConfig, PoolConfig, PoolClusterConfig} from "mariadb"
import {db_createConnection, db_createPoolClusterConnection, db_createPoolConnection} from "../Type/types";

export interface Config extends ConnectionConfig, PoolConfig, PoolClusterConfig {
    engine? : db_createConnection | db_createPoolConnection | db_createPoolClusterConnection
}