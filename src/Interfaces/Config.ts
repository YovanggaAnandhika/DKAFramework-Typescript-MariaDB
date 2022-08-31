import { ConnectionConfig, PoolConfig, PoolClusterConfig} from "mariadb"
import {db_createConnection, db_createPoolClusterConnection, db_createPoolConnection, Priodic} from "../Type/types";


export interface AutoBackupConfig {
    enabled ?: boolean,
    backupPriodic ?: Priodic | undefined,
    filename ?: string | undefined,
    dumpFileLocation ?: string | undefined,
    extension ?: string | undefined,
    forceReplace ?: boolean,
    compressFile ?: boolean
}
export interface Config extends ConnectionConfig, PoolConfig, PoolClusterConfig {
    engine? : db_createConnection | db_createPoolConnection | db_createPoolClusterConnection,
    autoBackup ?: AutoBackupConfig
}