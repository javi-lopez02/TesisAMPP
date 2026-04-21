import dotenv from 'dotenv';
dotenv.config();

export const TOKEN_SECRET: string = process.env.TOKEN_SECRET || "asjknbfdklsgadlkjs" ;

export const SERVER_URL: string = process.env.SERVER_URL || "http://localhost:4000" ;

export const HASH_SECRET: string = process.env.HASH_SECRET || "vjbnaklsjdb;kjasbdlkj";