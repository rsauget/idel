import dateparser
import hashlib
import logging
import re


class IdeLiberal:
    def __init__(self, browser):
        self.browser = browser

    def fetch_articles(self):
        self.browser.visit("http://www.ide-liberal.com/annonces.php?start=1&ipp=99999")
        self.browser.select("annonce_departement", "69")
        articles = self.browser.find_by_tag("article")
        logging.info('IdeLiberal: %d articles', len(articles))
        return list(map(self.parse_article, articles))

    def parse_article(self, article):
        properties = {"source": self.browser.url}
        properties["title"] = article.find_by_tag("h5").first.text
        logging.debug('IdeLiberal: article "%s"', properties["title"])
        tags = article.find_by_css(".list-inline > li")
        for tag in tags:
            span = tag.find_by_tag("span")
            if len(span) > 0:
                key = span.first.text
                value = tag.find_by_tag("a").first.text
                if "Département" in key:
                    properties["dept"] = value
                elif "Ville" in key:
                    properties["location"] = value
                elif "Type d'annonce" in key:
                    properties["type"] = value
                else:
                    properties[key] = value
            else:
                # Jeudi 21 Novembre 2019 à 11:09
                properties["date"] = dateparser.parse(tag.text)
        body = article.find_by_css(".post-body").first
        properties["description"] = body.find_by_tag("p").first.text
        properties["id"] = hashlib.md5(
            (properties["description"] + str(properties["date"])).encode()
        ).hexdigest()
        tags = body.find_by_tag("li")
        for tag in tags:
            value = tag.find_by_css(".reveal-inline-block").first.text
            if len(tag.find_by_css(".mdi-account")) > 0:
                properties["name"] = value
            elif len(tag.find_by_css(".mdi-phone")) > 0:
                properties["phone"] = re.sub(r"[ ._/-]+", "", value, re.MULTILINE)
            elif len(tag.find_by_css(".mdi-email-open")) > 0:
                properties["email"] = value
        return properties
