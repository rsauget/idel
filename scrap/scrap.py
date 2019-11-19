import dateparser
import hashlib
import googlemaps
import json
import logging
import os
import re
import sys
from datetime import datetime
from pprint import pprint
from selenium import webdriver
from splinter import Browser
from .sites.ide_liberal import IdeLiberal
from .sites.stethonet import Stethonet
from .sites.annonces_medicales import AnnoncesMedicales
from .sites.ordre_infirmiers import OrdreInfirmiers

USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36"

gmaps = googlemaps.Client(key=os.environ.get("GOOGLE_API_KEY"))


def get_route(source, destination):
    return gmaps.distance_matrix(source, destination)["rows"][0]["elements"][0]


class JSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if hasattr(obj, "isoformat"):
            return obj.isoformat()
        return json.JSONEncoder.default(self, obj)


def extract_phones(text):
    phone_regex = r"((?:\+\d{2,3})?\d{9,10})"
    phone_matches = set()
    for sep in " ._/-":
        cleaned_text = text.replace(sep, "")
        phone_matches.update(re.findall(phone_regex, cleaned_text, re.MULTILINE))
    return phone_matches


def extract_emails(text):
    mail_regex = r"([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)"
    mail_matches = set(re.findall(mail_regex, text, re.MULTILINE))
    return mail_matches


def fetch_articles():
    articles = list()
    logging.info("Initializing browser")
    options = webdriver.ChromeOptions()
    options.add_argument("--no-sandbox")
    options.add_argument("headless")
    options.add_argument("window-size=1920x1080")
    options.add_argument('user-agent="{0}"'.format(USER_AGENT))
    with Browser("chrome", options=options, wait_time=30) as browser:
        # try:
        #     logging.info("Scraping OrdreInfirmiers")
        #     articles += OrdreInfirmiers(browser).fetch_articles()
        # except:
        #     logging.error("Failed to scrap OrdreInfirmiers")
        try:
            logging.info("Scraping AnnoncesMedicales")
            articles += AnnoncesMedicales(browser).fetch_articles()
        except:
            logging.error("Failed to scrap AnnoncesMedicales")
        # try:
        #     logging.info("Scraping IdeLiberal")
        #     articles += IdeLiberal(browser).fetch_articles()
        # except:
        #     logging.error("Failed to scrap IdeLiberal")
        try:
            logging.info("Scraping Stethonet")
            articles += Stethonet(browser).fetch_articles()
        except:
            logging.error("Failed to scrap Stethonet")
    return articles


def enrich_articles(articles):
    logging.info("Enriching articles")
    known_locations = dict()
    try:
        with open("public/locations.json", "r") as f:
            known_locations = json.loads(f.read())
    except:
        logging.error("Failed to load known locations")
        pass
    for article in articles:
        # Enrich location with Google Maps geocoding API
        if "location" in article:
            location = article["location"]
            if location not in known_locations:
                logging.info("Requested location for " + location)
                known_locations[location] = gmaps.geocode(location, region="fr")[0]
            article["location"] = known_locations[location]
        # Extract unidentified phone numbers from plaintext
        phones = extract_phones(article["description"])
        if "phone" in article:
            if isinstance(article["phone"], str):
                phones.add(article["phone"])
            else:
                phones.update(article["phone"])
        article["phone"] = list(phones)
        # Extract unidentified email addresses from plaintext
        emails = extract_emails(article["description"])
        if "email" in article:
            emails.add(article["email"])
        article["email"] = list(emails)
    with open("public/locations.json", "w") as f:
        f.write(json.dumps(known_locations))


def write_articles(articles):
    logging.info("Saving articles to " + "public/articles.json")
    with open("public/articles.json", "w") as f:
        f.write(JSONEncoder().encode({"articles": articles, "updated": datetime.now()}))


def main():
    articles = fetch_articles()
    enrich_articles(articles)
    write_articles(articles)


if __name__ == "__main__":
    logging.basicConfig(
        stream=sys.stdout,
        level=logging.INFO,
        format="[%(asctime)s][%(name)s][%(levelname)s] %(message)s",
    )
    main()
