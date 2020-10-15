import { Article } from '../model/article';
import { FunctionComponent } from 'react';
import moment from 'moment';
import { renderEmail, renderPhone } from '../lib/helpers';

interface ArticleInfoProps {
  article: Article;
  isRead?: boolean;
  directions?: google.maps.DirectionsResult;
  markAsRead?: (id: string) => void;
}
export const ArticleInfo: FunctionComponent<ArticleInfoProps> = (props) => {
  const {
    article,
    isRead = false,
    directions,
    markAsRead = () => null,
  } = props;
  return (
    <div>
      <h2>{article.title || `Annonce n°${article.id}`}</h2>
      <p>
        Lieu : {article.location?.formatted_address ?? 'inconnu'}
        {directions &&
          directions.routes &&
          directions.routes.length > 0 &&
          directions.routes[0].legs &&
          directions.routes[0].legs.length > 0 &&
          ` (${directions.routes[0].legs[0].distance.text} - ${directions.routes[0].legs[0].duration.text})`}
      </p>
      <p>Date de l'annonce : {moment(article.date).format('LLL')}</p>
      <div>Email : {renderEmail(article.email)}</div>
      <div>Téléphone : {renderPhone(article.phone)}</div>
      <p>{article.description}</p>
      <p>
        <a href={article.source} target="_blank">
          Ouvrir l'annonce d'origine
        </a>
        <br />
        <a href={article.id}>Voir dans la liste</a>
      </p>
      <p>
        <button
          className={`btn btn-${isRead ? 'danger' : 'success'}`}
          type="button"
          onClick={() => markAsRead(article.id)}
        >
          {`Marquer comme ${isRead ? 'non lu' : 'lu'}`}
        </button>
        {typeof navigator !== 'undefined' && (navigator as any).share && (
          <button
            className="btn btn-secondary ml-2"
            type="button"
            onClick={() => {
              (navigator as any).share({
                title: article.title,
                text: article.description,
                url: `#${article.id}`,
              });
            }}
          >
            Partager
          </button>
        )}
      </p>
    </div>
  );
};
