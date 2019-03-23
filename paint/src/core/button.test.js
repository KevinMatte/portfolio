// Cell.react.test.js
import React from 'react';
import {render, fireEvent, cleanup, waitForElement} from 'react-testing-library';
import 'jest-dom/extend-expect'
import {act} from 'react-dom/test-utils';
import Button, {Controller} from './button';
// import renderer from 'react-test-renderer';

// automatically unmount and cleanup DOM after the test is finished.
afterEach(cleanup);

test('Button', () => {
    let tree, value;
    let controller = new Controller()

    const {container, getByTestId, asFragment} = render(
        <Button controller={controller}>Start</Button>,
    );

    tree = asFragment();
    expect(tree).toMatchSnapshot();

    act(() => {
        controller.targetProps.onMouseEnter({type: "mouseenter", currentTarget: {}})
        tree = asFragment();
    });
    expect(tree).toMatchSnapshot();
});

