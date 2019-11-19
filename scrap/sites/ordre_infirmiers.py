import dateparser
import hashlib
import logging
import re
import sys
from datetime import datetime

class OrdreInfirmiers:
    def __init__(self, browser):
        self.browser = browser

    def fetch_articles(self):
        self.browser.visit(
            "https://www.ordre-infirmiers.fr/la-profession-infirmiere/les-petites-annonces/auvergne-rhone-alpes.html"
        )
        articles = []
        pages = [
            link["href"]
            for link in self.browser.find_by_css("#pagination a:not(.next-pag)")
        ]
        for page in pages:
            logging.info(f"OrdreInfirmiers: Parsing page {page}")
            self.browser.visit(page)
            articles += list(
                map(
                    lambda a: self.parse_article(a),
                    [
                        link["href"]
                        for link in self.browser.find_by_css(".contenu_actu_home a")
                    ],
                )
            )
            logging.info('OrdreInfirmiers: %d articles', len(articles))
        return articles

    def parse_article(self, article):
        properties = {
            "source": article,
            "id": re.search(r"(\d+)\.html", article).group(1),
            "date": datetime.now(),
        }
        self.browser.visit(properties["source"])
        properties["email"] = (
            self.browser.find_by_css(".emailAnnonce")
            .first["href"]
            .split("?")[0]
            .split(":")[1]
        )
        tags = self.browser.find_by_css("#photo-annonce strong")
        for tag in tags:
            if tag.text.startswith("Ville :") or tag.text.startswith("Code Postal :"):
                if "location" in properties:
                    properties["location"] += tag.text.split(":")[1]
                else:
                    properties["location"] = tag.text.split(":")[1]
            elif tag.text.startswith("0"):
                properties["phone"] = tag.text
        properties["title"] = self.browser.find_by_id("titre-article").first.text
        properties["description"] = self.browser.find_by_id("corps-article").first.text
        logging.debug('OrdreInfirmiers: article "%s"', properties["title"])
        return properties
