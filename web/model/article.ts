export interface FetchedArticles {
  articles: Article[];
  updated: Date;
}

export interface Article {
  id: string;
  title: string;
  date: string;
  description: string;
  location?: google.maps.GeocoderResult;
  rawLocation?: string;
  phone?: string[];
  email?: string[];
  source: string;
}
