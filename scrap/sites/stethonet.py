import dateparser
import hashlib
import logging
import re


class Stethonet:
    def __init__(self, browser):
        self.browser = browser

    def fetch_articles(self):
        self.browser.visit(
            "http://www.stethonet.org/annoncephp/recherchedep.php?categorie=0"
        )
        self.browser.select("dep", "69")
        self.browser.find_by_name("Submit").first.click()
        articles = list(
            map(
                lambda a: self.parse_article(a, "Cession/Association/Colaboration"),
                self.browser.find_by_tag("ul"),
            )
        )
        logging.info("Stethonet: %d articles", len(articles))
        self.browser.visit(
            "http://www.stethonet.org/annoncephp/recherchedep.php?categorie=20"
        )
        self.browser.select("dep", "69")
        self.browser.find_by_name("Submit").first.click()
        articles += list(
            map(
                lambda a: self.parse_article(a, "Offre de remplacement"),
                self.browser.find_by_tag("ul"),
            ),
        )
        logging.info("Stethonet: %d articles", len(articles))
        return articles

    def parse_article(self, article, type):
        properties = {"source": self.browser.url, "type": type}
        regex = r"^N°(\d+) - (\d{2}\/\d{2}\/\d{2}) - (.*?)\nCode postal : ([0-9 ]+)$"
        matches = re.match(regex, article.text, re.MULTILINE | re.DOTALL)
        if matches is None:
            properties["description"] = article.text
            properties["id"] = hashlib.md5(
                (properties["description"]).encode()
            ).hexdigest()
        else:
            properties["id"] = matches.group(1)
            # 22/11/19
            properties["date"] = dateparser.parse(
                matches.group(2),
                languages=["fr"],
                locales=["fr-FR"],
            )
            properties["description"] = matches.group(3)
            properties["location"] = matches.group(4)
        logging.debug("Stethonet: article n°%s", properties["id"])
        return properties
