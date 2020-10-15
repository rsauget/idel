import { scrapArticlesAsync } from './../actions/index';
import { createReducer } from 'typesafe-actions';
import { Article } from '../model/article';
import { fetchArticlesAsync, markAsRead, showArticles } from '../actions';
import moment from 'moment';

export interface IdelState {
  articles: Article[];
  updated: moment.Moment;
  activeArticles: Article[];
  readArticles: Set<string>;
}

export const defaultIdelState = {
  articles: [],
  activeArticles: [],
  readArticles: new Set<string>()
};

export const rootReducer = createReducer(defaultIdelState)
  .handleAction(
    scrapArticlesAsync.success,
    (
      state: IdelState,
      action: ReturnType<typeof scrapArticlesAsync.success>
    ) => {
      return state;
    }
  )
  .handleAction(
    fetchArticlesAsync.success,
    (
      state: IdelState,
      action: ReturnType<typeof fetchArticlesAsync.success>
    ) => ({
      ...state,
      articles: action.payload.articles,
      updated: action.payload.updated
    })
  )
  .handleAction(
    markAsRead,
    (state: IdelState, action: ReturnType<typeof markAsRead>) => {
      const id = action.payload;
      const ids = new Set(state.readArticles);
      if (ids.has(id)) {
        ids.delete(id);
      } else {
        ids.add(id);
      }
      return {
        ...state,
        readArticles: ids
      };
    }
  )
  .handleAction(
    showArticles,
    (state: IdelState, action: ReturnType<typeof showArticles>) => ({
      ...state,
      activeArticles: action.payload
    })
  );
