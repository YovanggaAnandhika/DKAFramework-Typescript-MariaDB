import {Connection, Pool, PoolCluster} from "mariadb";

export type db_createConnection = "Connection";
export type db_createPoolConnection = "PoolConnection";
export type db_createPoolClusterConnection = "PoolClusterConnection";

export type Method = "READ" | "CREATE" | "UPDATE" | "DELETE" | undefined;
export type Instance = Promise<Connection> | Pool | PoolCluster | undefined;