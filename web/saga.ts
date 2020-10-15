import { scrapArticlesAsync } from './actions/index';
import { all, put, takeEvery } from 'redux-saga/effects';
import fetch from 'isomorphic-unfetch';

import { fetchArticlesAsync } from './actions';
import { IncomingMessage } from 'http';

function getBaseUrl(req: IncomingMessage | undefined, path: string) {
  if (!req) return path;
  const host = req
    ? req.headers['x-forwarded-host'] || req.headers.host
    : window.location.host;
  const proto = req
    ? req.headers['x-forwarded-proto'] || 'http'
    : window.location.protocol.slice(0, -1);
  return `${proto}://${host}${path}`;
}

function* fetchArticlesSaga(
  { payload: req }: ReturnType<typeof fetchArticlesAsync.request>
) {
  try {
    const url = getBaseUrl(req, '/articles.json')
    const res = yield fetch(url);
    const articles = yield res.json();
    yield put(fetchArticlesAsync.success(articles));
  } catch (err) {
    yield put(fetchArticlesAsync.failure(err));
  }
}

function* scrapArticlesSaga(
  { payload: req }: ReturnType<typeof scrapArticlesAsync.request>
) {
  try {
    const url = getBaseUrl(req, '/api/scrap')
    const res = yield fetch(url);
    yield put(scrapArticlesAsync.success(yield res.json()));
  } catch (err) {
    yield put(scrapArticlesAsync.failure(err));
  }
}

function* rootSaga() {
  yield takeEvery(fetchArticlesAsync.request, fetchArticlesSaga);
  yield takeEvery(scrapArticlesAsync.request, scrapArticlesSaga);
}

export default rootSaga;
