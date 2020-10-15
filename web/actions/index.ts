import { createAsyncAction, createAction } from 'typesafe-actions';
import { Article, FetchedArticles } from '../model/article';
import { IncomingMessage } from 'http';

export const fetchArticlesAsync = createAsyncAction(
  'FETCH_ARTICLES_REQUEST',
  'FETCH_ARTICLES_SUCCESS',
  'FETCH_ARTICLES_FAILURE'
)<IncomingMessage | undefined, FetchedArticles, Error>();

export const markAsRead = createAction('MARK_AS_READ')<string>();

export const showArticles = createAction('SHOW_ARTICLES')<Article[]>();

export const scrapArticlesAsync = createAsyncAction(
  'SCRAP_ARTICLES_REQUEST',
  'SCRAP_ARTICLES_SUCCESS',
  'SCRAP_ARTICLES_FAILURE'
)<IncomingMessage | undefined, any, Error>();