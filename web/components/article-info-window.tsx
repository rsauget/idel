import { useSelector, useDispatch } from 'react-redux';
import { IdelState } from '../reducers';
import { Article } from '../model/article';
import {
  InfoWindow,
  DirectionsRenderer,
  DirectionsService
} from '@react-google-maps/api';
import { ArticleInfo } from './article-info';
import * as actions from '../actions';
import { useState, FunctionComponent } from 'react';

interface ArticleInfoWindowProps {
  home: google.maps.LatLng | google.maps.LatLngLiteral;
  onClose: () => void;
}

export const ArticleInfoWindow: FunctionComponent<ArticleInfoWindowProps> = props => {
  const { home, onClose } = props;

  const dispatch = useDispatch();

  const [directions, setDirections] = useState<google.maps.DirectionsResult>();

  const activeArticles = useSelector<IdelState, Article[]>(
    store => store.activeArticles
  );

  const readArticles = useSelector<IdelState, Set<string>>(
    store => store.readArticles
  );

  const markAsRead = (id: string) => dispatch(actions.markAsRead(id));

  if (!activeArticles || activeArticles.length === 0) {
    return null;
  }

  return (
    <>
      <InfoWindow
        position={activeArticles[0].location.geometry.location}
        options={{ pixelOffset: new google.maps.Size(-1, -23) }}
        onCloseClick={onClose}
        onPositionChanged={() => setDirections(undefined)}
      >
        <div>
          {activeArticles.length > 1 && (
            <h2>{`${activeArticles.length} annonces`}</h2>
          )}
          {activeArticles.map(article => (
            <ArticleInfo
              key={article.id}
              article={article}
              isRead={readArticles.has(article.id)}
              directions={directions}
              markAsRead={markAsRead}
            />
          ))}
          <style jsx>{`
            p {
              white-space: pre-wrap;
            }
          `}</style>
        </div>
      </InfoWindow>
      {directions && (
        <DirectionsRenderer
          options={{
            directions,
            preserveViewport: true
          }}
        />
      )}
      {!directions && (
        <DirectionsService
          options={{
            destination: activeArticles[0].location.geometry.location,
            origin: home,
            travelMode: google.maps.TravelMode.DRIVING
          }}
          callback={setDirections}
        />
      )}
    </>
  );
};
