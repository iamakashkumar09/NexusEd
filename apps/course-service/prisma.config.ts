import { defineConfig } from '@prisma/config';
import * as path from 'path';
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
});

