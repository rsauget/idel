import App, { AppContext } from 'next/app';
import React from 'react';
import { Provider } from 'react-redux';
import withRedux, { AppProps } from 'next-redux-wrapper';
import withReduxSaga from 'next-redux-saga';

import { configureStore } from '../store';

class MyApp extends App<AppProps> {
  static async getInitialProps({ Component, ctx }: AppContext) {
    let pageProps = {};

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }

    return { pageProps };
  }

  render() {
    const { Component, pageProps, store } = this.props;
    return (
      <Provider store={store}>
        <Component {...pageProps} />
      </Provider>
    );
  }
}

export default withRedux(configureStore, {
  serializeState: state =>
    state && {
      ...state,
      readArticles: [...state.readArticles]
    },
  deserializeState: state =>
    state && {
      ...state,
      readArticles: new Set(state.readArticles)
    }
})(withReduxSaga(MyApp));
