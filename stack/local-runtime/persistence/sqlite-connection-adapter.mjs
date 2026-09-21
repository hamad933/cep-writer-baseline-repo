import {DatabaseSync,backup as nodeBackup} from 'node:sqlite';

const normalizeRun=value=>({changes:Number(value?.changes??0),lastInsertRowid:value?.lastInsertRowid==null?null:String(value.lastInsertRowid)});

export class SqliteConnectionAdapter{
  constructor(databasePath){this.driverId='node:sqlite';this.databasePath=databasePath;this.db=new DatabaseSync(databasePath);this.db.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA busy_timeout=2000;')}
  exec(sql){this.db.exec(sql)}
  prepare(sql){const statement=this.db.prepare(sql);return {run:(...params)=>normalizeRun(statement.run(...params)),get:(...params)=>statement.get(...params),all:(...params)=>statement.all(...params)}}
  transaction(work){this.db.exec('BEGIN IMMEDIATE');try{const result=work();this.db.exec('COMMIT');return result}catch(error){try{this.db.exec('ROLLBACK')}catch{}throw error}}
  async backupTo(targetPath){const pages=await nodeBackup(this.db,targetPath);return {ok:true,driverId:this.driverId,targetPath,pages}}
  close(){this.db.close()}
}

export const createSqliteConnectionAdapter=({databasePath})=>new SqliteConnectionAdapter(databasePath);
