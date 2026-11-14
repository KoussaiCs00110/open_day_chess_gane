import { defineConfig } from 'vite';
export default defineConfig({base:'./',test:{include:['src/**/*.test.js']},server:{host:'0.0.0.0'}});
