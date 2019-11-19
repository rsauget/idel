import { all, put, takeEvery } from 'redux-saga/effects';
import fetch from 'isomorphic-unfetch';

import { fetchArticlesAsync } from './actions';

function* fetchArticlesSaga(
  action: ReturnType<typeof fetchArticlesAsync.request>
) {
  try {
    const req = action.payload;
    const path = '/articles.json';
    let url = path;
    if (req) {
      const host = req
        ? req.headers['x-forwarded-host'] || req.headers.host
        : window.location.host;
      const proto = req
        ? req.headers['x-forwarded-proto'] || 'http'
        : window.location.protocol.slice(0, -1);
      url = `${proto}://${host}${path}`;
    }
    const res = yield fetch(url);
    const articles = yield res.json();
    yield put(fetchArticlesAsync.success(articles));
  } catch (err) {
    yield put(fetchArticlesAsync.failure(err));
  }
}

function* rootSaga() {
  yield all([takeEvery(fetchArticlesAsync.request, fetchArticlesSaga)]);
}

export default rootSaga;
