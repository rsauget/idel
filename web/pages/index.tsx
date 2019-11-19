import React, { FormEvent, useState } from 'react';
import {
  Navbar,
  Nav,
  Form,
  FormControl,
  Button,
  Container
} from 'react-bootstrap';
import moment from 'moment';
import { NextPage } from 'next';
import { connect, useDispatch } from 'react-redux';
import { ArticlesMap } from '../components/articles-map';
import '../index.scss';
import { ArticlesList } from '../components/articles-list';
import { NextJSContext } from 'next-redux-wrapper';
import { IdelState } from '../reducers';
import { fetchArticlesAsync } from '../actions';

moment.locale('fr');

const App: NextPage = () => {
  // const [search, setSearch] = useState('');

  // const onSubmit = (event: FormEvent) => {
  //   event.preventDefault();
  //   alert(search);
  // };
  const dispatch = useDispatch();

  const refresh = () => dispatch(fetchArticlesAsync.request(undefined));

  return (
    <div>
      <Navbar variant="light" bg="light" expand="lg">
        <Navbar.Brand href="#">IDEL</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="navbarSupportedContent">
          <Nav className="mr-auto">
            <Nav.Link href="#map">Carte</Nav.Link>
            <Nav.Link href="#list">Liste</Nav.Link>
            <Nav.Link href="#" onClick={() => refresh()}>
              Actualiser
            </Nav.Link>
          </Nav>
          {/* <Form inline onSubmit={onSubmit}>
            <FormControl
              className="mr-sm-2"
              type="search"
              placeholder="Rechercher"
              value={search}
              onChange={(event: FormEvent<HTMLInputElement>) =>
                setSearch(event.currentTarget.value)
              }
            />
            <Button
              variant="outline-success"
              type="submit"
            >
              Rechercher
            </Button>
          </Form> */}
        </Navbar.Collapse>
      </Navbar>
      <Container fluid={true}>
        <ArticlesMap id="map" className="row" />
        <ArticlesList id="list" className="row" />
      </Container>
    </div>
  );
};

App.getInitialProps = async (ctx: NextJSContext<IdelState>) => {
  const { store, req } = ctx;
  store.dispatch(fetchArticlesAsync.request(req));
  return {};
};

export default connect()(App);
