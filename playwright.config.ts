import { defineConfig } from '@playwright/test';
export default defineConfig({testDir:'./tests',testMatch:'**/*.spec.ts',workers:1,use:{baseURL:'http://127.0.0.1:3999',headless:true,launchOptions:{executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']}},webServer:{command:'npm run start -- --port 3999',url:'http://127.0.0.1:3999',reuseExistingServer:true},reporter:'list'});
