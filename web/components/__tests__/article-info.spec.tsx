import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { ArticleInfo } from '../article-info';
import moment from 'moment';
import { Article } from '../../model/article';

const LOCATION = {
  address_components: [
    {
      long_name: '69570',
      short_name: '69570',
      types: ['postal_code']
    },
    {
      long_name: 'Dardilly',
      short_name: 'Dardilly',
      types: ['locality', 'political']
    },
    {
      long_name: 'Rhône',
      short_name: 'Rhône',
      types: ['administrative_area_level_2', 'political']
    },
    {
      long_name: 'Auvergne-Rhône-Alpes',
      short_name: 'Auvergne-Rhône-Alpes',
      types: ['administrative_area_level_1', 'political']
    },
    {
      long_name: 'France',
      short_name: 'FR',
      types: ['country', 'political']
    }
  ],
  formatted_address: '69570 Dardilly, France',
  geometry: {
    bounds: {
      northeast: {
        lat: 45.8390779,
        lng: 4.771228199999999
      },
      southwest: {
        lat: 45.7875676,
        lng: 4.7219452
      }
    },
    location: {
      lat: 45.8153104,
      lng: 4.7415845
    },
    location_type: 'APPROXIMATE',
    viewport: {
      northeast: {
        lat: 45.8390779,
        lng: 4.771228199999999
      },
      southwest: {
        lat: 45.7875676,
        lng: 4.7219452
      }
    }
  },
  place_id: 'ChIJtTNWzdCS9EcRAHPkQS6rCBw',
  types: ['postal_code']
};

const ARTICLE: Article = {
  id: 'FAKE',
  title: 'Recherche remplaçant IDEL',
  date: '2019-11-28T16:47:53.195Z',
  description:
    "Je suis à la recherche d'un IDEL pour me remplacer pendant les congés de fin d'année, soit du 21/12 au 05/01.",
  email: ['raphael@sauget.pro'],
  phone: [],
  location: LOCATION as any
};

const checkArticleInfo = (component: ShallowWrapper, isRead: boolean) => {
  expect(
    component.contains([
      <h2>{ARTICLE.title}</h2>,
      <p>Lieu : {LOCATION.formatted_address}</p>,
      <p>Date de l'annonce : {moment(ARTICLE.date).format('LLL')}</p>,
      <div>
        Email : <a href={`mailto:${ARTICLE.email[0]}`}>{ARTICLE.email[0]}</a>
      </div>,
      <div>Téléphone : Non communiqué</div>,
      <p>{ARTICLE.description}</p>
    ])
  ).toBeTruthy();
  expect(
    component.containsMatchingElement(
      <button
        className={`btn btn-${isRead ? 'danger' : 'success'}`}
        type="button"
      >
        Marquer comme {isRead ? 'non lu' : 'lu'}
      </button>
    )
  ).toBeTruthy();
};

it('renders article', () => {
  const component = shallow(<ArticleInfo article={ARTICLE} />);
  checkArticleInfo(component, false);

  component.setProps({ isRead: true });
  checkArticleInfo(component, true);
});
