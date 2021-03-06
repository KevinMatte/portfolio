/* Copyright (C) 2019 Kevin Matte - All Rights Reserved */

// Cell.react.test.js
import React from 'react';
import {render, fireEvent, cleanup, waitForElement} from 'react-testing-library';
import 'jest-dom/extend-expect'
import Cell from './cell';
// import renderer from 'react-test-renderer';

// automatically unmount and cleanup DOM after the test is finished.
afterEach(cleanup);

// noinspection ES6ModulesDependencies
test('Cell: Edit mode: off', () => {
  let tree, value;

  let mockSetValue = jest.fn();
  value = "hello";
  const {container, getByTestId, asFragment} = render(
    <Cell doEdit={false} value={value} setValue={mockSetValue}>Facebook</Cell>,
  );

  tree = asFragment();
  expect(tree).toMatchSnapshot();

});

// noinspection ES6ModulesDependencies
test('Cell: Edit mode: on', () => {
  let tree, value;
  let mockSetValue = jest.fn();
  value = "hello";
  const {container, getByTestId, asFragment} = render(
    <Cell doEdit={true} value={value} setValue={mockSetValue}>Facebook</Cell>,
  );

  tree = asFragment();
  expect(tree).toMatchSnapshot();

  let cell = getByTestId("Cell");
  let input = cell.querySelector('input');
  fireEvent.change(input, { target: { value: 'A' } });
  expect(mockSetValue.mock.calls.length).toBe(1);
  expect(mockSetValue.mock.calls[0][0]).toBe('A');

});
