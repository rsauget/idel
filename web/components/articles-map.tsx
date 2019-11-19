import React, { HTMLAttributes, FunctionComponent } from 'react';
import { Article } from '../model/article';
import {
  LoadScript,
  GoogleMap,
  MarkerClusterer,
  Marker,
} from '@react-google-maps/api';
import { Cluster } from '@react-google-maps/marker-clusterer';
import { useSelector, useDispatch } from 'react-redux';
import { IdelState } from '../reducers';
import * as actions from '../actions';
import { ArticleMarker } from './article-marker';
import { ArticleInfoWindow } from './article-info-window';

const HOME = { lat: 45.818359, lng: 4.720007 };
const MAX_ZOOM = 15;

export const ArticlesMap: FunctionComponent<HTMLAttributes<HTMLDivElement>> = (
  props
) => {
  const dispatch = useDispatch();

  const articles = useSelector<IdelState, Article[]>((store) => store.articles);

  const readArticles = useSelector<IdelState, Set<string>>(
    (store) => store.readArticles
  );

  const showArticles = (articles: Article[] = []) =>
    dispatch(actions.showArticles(articles));

  const showAllArticlesInCluster = (cluster: Cluster) => {
    const map = cluster.getMap();
    const zoom = map.getZoom();
    if (zoom < MAX_ZOOM && map instanceof google.maps.Map) {
      map.fitBounds(cluster.getBounds(), 20);
      if (map.getZoom() > MAX_ZOOM) {
        map.setZoom(MAX_ZOOM);
      }
    } else {
      const groupedArticles = articles.filter((article) => {
        if (article.location == null) {
          return false;
        }
        const articleLocation = article.location.geometry.location;
        const clusterBounds = cluster.getBounds();
        return clusterBounds.contains(articleLocation);
      });
      showArticles(groupedArticles);
    }
  };

  return (
    <div {...props}>
      <LoadScript googleMapsApiKey="AIzaSyAkSEQwSxRMQS7VUOs80DgbnlkQEPaf6LQ">
        <GoogleMap
          id="idel-map"
          zoom={10}
          mapContainerStyle={{
            height: '100vh',
            width: '100%',
          }}
          center={HOME}
          onClick={() => showArticles()}
        >
          <Marker
            position={HOME}
            icon={{
              url: '//maps.google.com/mapfiles/ms/icons/blue-dot.png',
            }}
            onClick={() => showArticles()}
          />
          <ArticleInfoWindow home={HOME} onClose={() => showArticles()} />
          <MarkerClusterer
            averageCenter
            enableRetinaIcons
            gridSize={60}
            zoomOnClick={false}
            onClick={showAllArticlesInCluster}
          >
            {(clusterer) =>
              articles.map((article) => (
                <ArticleMarker
                  article={article}
                  clusterer={clusterer}
                  isRead={readArticles.has(article.id)}
                  onClick={() => showArticles([article])}
                  key={article.id || article.title}
                />
              ))
            }
          </MarkerClusterer>
        </GoogleMap>
      </LoadScript>
    </div>
  );
};
