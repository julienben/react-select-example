import React from 'react';
import { shallow } from 'enzyme';

import Option from '../Option';

describe('<Option />', () => {
  let wrapper;
  let instance;
  let switchSelectedOption;
  let switchHighlightedOption;

  beforeEach(() => {
    switchSelectedOption = jest.fn();
    switchHighlightedOption = jest.fn();
    wrapper = shallow(
      <Option
        name="AnyName"
        index={0}
        switchSelectedOption={switchSelectedOption}
        switchHighlightedOption={switchHighlightedOption}
      />,
    );
    instance = wrapper.instance();
  });

  it('renders', () => {
    expect(wrapper).toBeDefined();
    expect(wrapper.html()).not.toBeNull();
  });

  describe('onClick', () => {
    it('should select the option', () => {
      instance.onClick();
      expect(switchSelectedOption).toHaveBeenCalledTimes(1);
    });
  });

  describe('onMouseEnter', () => {
    it('should highlight the option', () => {
      instance.onMouseEnter();
      expect(switchHighlightedOption).toHaveBeenCalledTimes(1);
    });
  });
});

describe('<Option /> alternative branches', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(
      <Option
        name="AnyName"
        index={0}
        switchSelectedOption={jest.fn()}
        switchHighlightedOption={jest.fn()}
      >
        children
      </Option>,
    );
  });

  it('renders', () => {
    expect(wrapper).toBeDefined();
    expect(wrapper.html()).not.toBeNull();
  });
});
