declare namespace NodeJS {
  interface ProcessEnv {
    MONGO_URI: string;
    NODE_ENV: 'development' | 'production' | 'local';
    PORT: string;
    JWT_SECRET: string;
  }
}
