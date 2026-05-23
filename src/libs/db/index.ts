import 'dotenv/config';
import { conn } from './conn';

// Import from Astro env or process.env depending on environment context
const DATABASE_URL = typeof import.meta.env !== "undefined" 
    ? import.meta.env.DATABASE_URL 
    : process.env.DATABASE_URL;

if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');

export const db = conn(DATABASE_URL);
