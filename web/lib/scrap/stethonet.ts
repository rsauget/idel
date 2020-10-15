import moment from 'moment';
import { ElementHandle, Browser, Page } from 'puppeteer';
import { logger } from '../logger';
import { Article } from './../../model/article';
import { buildRegexp, md5 } from './utils';

export async function scrapStethonet(browser: Browser) {
    logger.debug("Scrap stethonet");
    return (await Promise.all([
        fetchArticles(
            browser,
            "http://www.stethonet.org/annoncephp/recherchedep.php?categorie=0",
            "Cession/Association/Collaboration"
        ),
        fetchArticles(
            browser,
            "http://www.stethonet.org/annoncephp/recherchedep.php?categorie=20",
            "Offre de remplacement"
        )
    ])).flat();
};

const fetchArticles = async (browser: Browser, url: string, type: string) => {
    const page = await browser.newPage();
    await page.goto(url);
    await page.select("[name=dep]", "69");
    await page.click("[name=Submit]");
    const articles = await page.$$("ul").mapSequential(parseArticle(page, type));
    logger.debug({
        url,
        type,
        articles: articles.length
    }, `Fetched Stethonet articles`)
    return articles;
}

const parseArticle = (page: Page, type: string) => async (articleElement: ElementHandle<Element>): Promise<Article> => {
    const baseProperties = {
        source: page.url(),
        type
    }
    const regex = buildRegexp(
        /^N°(?<id>\d+)/,
        /\s*-\s*/,
        /(?<date>\d{2}\/\d{2}\/\d{2})/,
        /\s*-\s*/,
        /(?<description>.*?)/,
        /Code postal : (?<location>[0-9]+)$/
    );
    const text: string = await page.evaluate(el => el.textContent, articleElement);
    const [match] = [...text.matchAll(regex)];
    if (match?.groups) {
        const { groups } = match;
        const id = groups['id'];
        const date = moment(groups['date'], 'DD/MM/YY').toISOString();
        const description = groups['description'];
        const location = groups['location'];
        const article = {
            ...baseProperties,
            id,
            title: `Annonce n°${id}`,
            date,
            description,
            rawLocation: location
        };
        logger.debug(article, "Stethonet article")
        return article;
    } else {
        logger.error({
            ...baseProperties,
            text
        }, 'Failed to parse Stethonet article');
        return {
            ...baseProperties,
            description: text,
            id: md5(text),
            title: `Annonce non reconnue`,
            date: moment().toISOString(),
        }
    }
}