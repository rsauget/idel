import logging
import os
import requests

EMAIL = os.environ.get("ANNONCES_MEDICALES_LOGIN")
PASSWORD = os.environ.get("ANNONCES_MEDICALES_PASSWORD")


class AnnoncesMedicales:
    def __init__(self, browser):
        self.browser = browser
        self.session = requests.session()

    def fetch_articles(self):
        self.session.post(
            "https://www.annonces-medicales.com/Login/Login",
            data={"email": EMAIL, "password": PASSWORD},
        )
        articles = self.session.post(
            "https://www.annonces-medicales.com/Jobs/SearchAjax",
            data={
                "CategoryIds": "infirmier-liberal",
                "ContractIds": "remplacement-regulier,remplacement-occasionnel",
                "IncludePartners": True,
                "DeptIds": "69-rhone",
                "Page": 0,
                "OCCFrom": "",
                "OCCTo": "",
                "INSSubtypes": "3,5,2,1,4",
                "EnablePaging": False,
            },
        ).json()
        logging.info("AnnoncesMedicales: %d articles", len(articles["Ads"]))
        return list(map(self.parse_article, articles["Ads"]))

    def parse_article(self, article):
        properties = {
            "id": article["Id"],
            "source": article["Url"],
            "title": article["Title"],
            "description": article["RawText"],
            "date": article["ModificationDate"],
            "location": article["WorkLocationAddress"],
            "phone": [],
        }
        logging.debug('AnnoncesMedicales: article "%s"', properties["title"])
        phone = self.browser.evaluate_script("window.AdPhone")
        if phone is not None:
            properties["phone"].append(phone)
        try:
            properties["phone"].append(
                self.session.post(
                    "https://www.annonces-medicales.com/apiv2/Ads/GetAdPhoneNumber",
                    data={"AdId": properties["id"]},
                ).json()["Messages"][0]
            )
        except:
            pass
        if properties["description"].endswith("..."):
            self.browser.visit(article["Url"])
            properties["description"] = self.browser.find_by_css(
                ".annonce-texte"
            ).first.text
        return properties
