import puppeteer from 'puppeteer';
import { scrapStethonet } from './stethonet';

export async function scrap() {
  const browser = await puppeteer.launch();
  return [
    ...await scrapStethonet(browser),
  ];
};