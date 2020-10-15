import React, { FunctionComponent, HTMLAttributes } from 'react';
import moment from 'moment';
import { Article } from '../model/article';
import { renderEmail, renderPhone } from '../lib/helpers';
import { useSelector, useDispatch, useStore } from 'react-redux';
import { IdelState } from '../reducers';
import * as actions from '../actions';

export const ArticlesList: FunctionComponent<HTMLAttributes<HTMLDivElement>> = (
  props
) => {
  const articles = useSelector<IdelState, Article[]>((store) => store.articles);
  const result = articles.sort((a, b) => (a.date > b.date ? 1 : -1)).reverse();
  const readArticles = useSelector<IdelState, Set<string>>(
    (store) => store.readArticles
  );
  const dispatch = useDispatch();
  const markAsRead = (id: string) => dispatch(actions.markAsRead(id));
  const showArticles = (articles: Article[]) =>
    dispatch(actions.showArticles(articles));
  return (
    <div {...props}>
      <table className="table table-hover table-responsive">
        <thead>
          <tr>
            {/* <th>ID</th> */}
            <th></th>
            <th>Titre</th>
            <th>Date</th>
            <th>Lieu</th>
            <th>Email</th>
            <th>Téléphone</th>
          </tr>
        </thead>
        <tbody>
          {result.map((article) => (
            <tr
              key={article.id}
              id={article.id}
              className={
                readArticles.has(article.id) ? 'table-success' : undefined
              }
            >
              {/* <td>{id}</td> */}
              <td>
                <button
                  className={`btn btn-${readArticles.has(article.id) ? 'danger' : 'success'
                    }`}
                  type="button"
                  onClick={() => markAsRead(article.id)}
                >
                  {readArticles.has(article.id) ? 'Non lu' : 'Lu'}
                </button>
                <button
                  className="btn btn-primary mt-1"
                  type="button"
                  onClick={() => {
                    showArticles([article]);
                    window.scrollTo(0, 0);
                  }}
                >
                  Voir
                </button>
                {typeof navigator !== 'undefined' && (navigator as any).share && (
                  <button
                    className="btn btn-secondary mt-1"
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
              </td>
              <td>{article.title || `Annonce n°${article.id}`}</td>
              <td>{moment(article.date).format('LLL')}</td>
              <td>{article.location?.formatted_address ?? 'inconnu'}</td>
              <td>{renderEmail(article.email)}</td>
              <td>{renderPhone(article.phone)}</td>
              <td className="pre">
                {article.description}
                <br />
                <a href={article.source} target="_blank">
                  Ouvrir l'annonce d'origine
                </a>
              </td>
            </tr>
          ))}
        </tbody>
        <style jsx>{`
          td.pre {
            white-space: pre-wrap;
          }
        `}</style>
      </table>
    </div>
  );
};
