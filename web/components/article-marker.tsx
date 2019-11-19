import { Article } from '../model/article';

import { Clusterer } from '@react-google-maps/marker-clusterer';

import { Marker } from '@react-google-maps/api';
import { FunctionComponent } from 'react';

interface ArticleMarkerProps {
  article: Article;
  isRead: boolean;
  onClick: () => void;
  clusterer?: Clusterer;
}
export const ArticleMarker: FunctionComponent<ArticleMarkerProps> = props => {
  const { article, isRead, onClick, clusterer } = props;
  if (article.location == null) {
    return null;
  }
  return (
    <Marker
      clusterer={clusterer}
      position={article.location.geometry.location}
      title={article.title}
      icon={{
        url: `//maps.google.com/mapfiles/ms/icons/${
          isRead ? 'green' : 'red'
        }-dot.png`
      }}
      onClick={onClick}
      key={article.id || article.title}
    />
  );
};
