// Cell.react.test.js
import React from 'react';
import {render, fireEvent, cleanup, waitForElement} from 'react-testing-library';
import 'jest-dom/extend-expect'
import Cell from './Cell';
// import renderer from 'react-test-renderer';

// automatically unmount and cleanup DOM after the test is finished.
afterEach(cleanup);

test('Cell: Edit mode: off', () => {
  let tree, value;

  value = "hello";
  const {container, getByTestId, asFragment} = render(
    <Cell doEdit={false} value={value} setValue={(value) => console.log(value)}>Facebook</Cell>,
  );

  tree = asFragment();
  expect(tree).toMatchSnapshot();

  let cell = getByTestId("Cell");
  fireEvent.click(cell);
  tree = asFragment();
  expect(tree).toMatchSnapshot();

});

test('Cell: Edit mode: on', () => {
  let tree, value;

  value = "hello";
  const {container, getByTestId, asFragment} = render(
    <Cell doEdit={true} value={value} setValue={(value) => console.log(value)}>Facebook</Cell>,
  );

  tree = asFragment();
  expect(tree).toMatchSnapshot();

  let cell = getByTestId("Cell");
  fireEvent.click(cell);
  tree = asFragment();
  expect(tree).toMatchSnapshot();

});
