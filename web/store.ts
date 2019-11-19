import { applyMiddleware, Middleware, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { persistStore, persistReducer, createTransform } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { rootReducer, defaultIdelState, IdelState } from './reducers';
import rootSaga from './saga';
import { MakeStore } from 'next-redux-wrapper';

const persistConfig = {
  key: 'idel',
  whitelist: ['readArticles'],
  storage,
  transforms: [
    createTransform(
      (inboundState: any, key) =>
        key === 'readArticles' ? [...inboundState] : inboundState,
      (outboundState: any, key) =>
        key === 'readArticles' ? new Set(outboundState) : outboundState
    )
  ]
  // stateReconciler: (
  //   inboundState: IdelState,
  //   _originalState: IdelState,
  //   reducedState: IdelState
  // ): IdelState => {
  //   console.log('reconcile', inboundState, _originalState, reducedState);
  //   let newState = { ...reducedState };
  //   if (
  //     inboundState &&
  //     typeof inboundState === 'object' &&
  //     inboundState.readArticles
  //   ) {
  //     newState.readArticles = inboundState.readArticles;
  //   }
  //   return newState;
  // }
};

const bindMiddleware = (...middleware: Middleware[]) => {
  if (process.env.NODE_ENV !== 'production') {
    const { composeWithDevTools } = require('redux-devtools-extension');
    return composeWithDevTools(applyMiddleware(...middleware));
  }
  return applyMiddleware(...middleware);
};

export const configureStore: MakeStore = (
  initialState = defaultIdelState,
  { isServer }
) => {
  const sagaMiddleware = createSagaMiddleware();
  let reducer;
  if (isServer) {
    reducer = rootReducer;
  } else {
    reducer = persistReducer(persistConfig, rootReducer);
  }
  const store: any = createStore(
    reducer,
    initialState,
    bindMiddleware(sagaMiddleware)
  );

  store.sagaTask = sagaMiddleware.run(rootSaga);

  if (!isServer) {
    store.persistor = persistStore(store);
  }

  return store;
};
