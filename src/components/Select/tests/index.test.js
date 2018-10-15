import React from 'react';
import { mount } from 'enzyme';

import Select from '../index';

const sampleOptions = [
  { name: 'All', value: 'All' },
  { name: '12 hours', value: '12' },
  { name: '24 hours', value: '24' },
  { name: '48 hours', value: '48' },
  { name: '72 hours', value: '72' },
];

jest.useFakeTimers();

window.innerHeight = 1000;

describe('<Select />', () => {
  let wrapper;
  let instance;
  let onChange;
  let name;

  beforeEach(() => {
    onChange = jest.fn();
    name = 'AnyName';
    wrapper = mount(
      <Select
        name={name}
        value={sampleOptions[0].value}
        labelText="Label"
        onChange={onChange}
        options={sampleOptions}
      />,
    );
    instance = wrapper.instance();
  });

  it('renders', () => {
    expect(wrapper).toBeDefined();
    expect(wrapper.html()).not.toBeNull();
  });

  describe('componentDidMount()', () => {
    it('should prepare the coordinates for first render', () => {
      instance.setAbsoluteStyleCoordinates = jest.fn();
      instance.componentDidMount();
      expect(instance.setAbsoluteStyleCoordinates).toHaveBeenCalledTimes(1);
    });

    it('should focus if autoFocus is true', () => {
      wrapper.setProps({ autoFocus: true });
      instance.domNode = {
        focus: jest.fn(),
      };
      instance.setAbsoluteStyleCoordinates = jest.fn();
      instance.componentDidMount();
      expect(instance.domNode.focus).toHaveBeenCalledTimes(1);
    });

    it('shouldnt focus if autoFocus is false', () => {
      wrapper.setProps({ autoFocus: false });
      instance.domNode = {
        focus: jest.fn(),
      };
      instance.setAbsoluteStyleCoordinates = jest.fn();
      instance.componentDidMount();
      expect(instance.domNode.focus).not.toHaveBeenCalled();
    });
  });

  describe('setAbsoluteStyleCoordinates', () => {
    it('should calculate and set coordinates in the state to enable positioning the options box right under the select box', () => {
      instance.setState = jest.fn();
      instance.domNode = {
        getBoundingClientRect: jest.fn(() => ({
          top: 100,
          height: 300,
          width: 200,
          left: 50,
        })),
      };
      // instance.domNode.getBoundingClientRect = jest.fn();
      instance.setAbsoluteStyleCoordinates();
      expect(instance.setState).toHaveBeenCalledTimes(1);
      expect(instance.setState).toHaveBeenCalledWith({
        style: {
          top: 400,
          width: 200,
          left: 50,
          maxHeight: 250,
        },
      });
    });
  });

  describe('toggleOptions', () => {
    let e;

    beforeEach(() => {
      e = {
        stopPropagation: jest.fn(),
      };
      instance.hideOptions = jest.fn();
      instance.showOptions = jest.fn();
    });

    it('should stop propagation in all situations', () => {
      instance.toggleOptions(e);
      expect(e.stopPropagation).toHaveBeenCalledTimes(1);

      e.stopPropagation.mockClear();
      wrapper.setState({ open: !wrapper.state('open') });
      instance.toggleOptions(e);
      expect(e.stopPropagation).toHaveBeenCalledTimes(1);
    });

    it('should call hideOptions if open', () => {
      wrapper.setState({ open: true });
      instance.toggleOptions(e);
      expect(instance.showOptions).toHaveBeenCalledTimes(0);
      expect(instance.hideOptions).toHaveBeenCalledTimes(1);
    });

    it('should call showOptions if closed', () => {
      wrapper.setState({ open: false });
      instance.toggleOptions(e);
      expect(instance.showOptions).toHaveBeenCalledTimes(1);
      expect(instance.hideOptions).toHaveBeenCalledTimes(0);
    });
  });

  describe('showOptions', () => {
    it('should show the options', () => {
      instance.setState = jest.fn();
      instance.showOptions();
      expect(instance.setState).toHaveBeenCalledTimes(1);
      expect(instance.setState.mock.calls[0][0]).toEqual({ open: true });
    });

    it('should set the positioning coordinates and add the event listeners in a callback', () => {
      instance.setState = jest.fn((state, callback) => callback());
      instance.setAbsoluteStyleCoordinates = jest.fn();
      instance.addEventListeners = jest.fn();
      instance.showOptions();
      expect(instance.setState).toHaveBeenCalledTimes(1);
      expect(instance.setAbsoluteStyleCoordinates).toHaveBeenCalledTimes(1);
      expect(instance.addEventListeners).toHaveBeenCalledTimes(1);
    });
  });

  describe('hideOptions', () => {
    it('should hide the options', () => {
      instance.setState = jest.fn();
      instance.hideOptions();
      expect(instance.setState).toHaveBeenCalledTimes(1);
      expect(instance.setState.mock.calls[0][0]).toEqual({ open: false });
    });

    it('should remove the event listeners in a callback', () => {
      instance.setState = jest.fn((state, callback) => callback());
      instance.removeEventListeners = jest.fn();
      instance.hideOptions();
      expect(instance.setState).toHaveBeenCalledTimes(1);
      expect(instance.removeEventListeners).toHaveBeenCalledTimes(1);
    });
  });

  describe('onClickOutsideSelectBox', () => {
    it('should hide the options using a timer', () => {
      instance.hideOptions = jest.fn();
      instance.onClickOutsideSelectBox();
      expect(instance.hideOptions).toHaveBeenCalledTimes(0);
      jest.runAllTimers();
      expect(instance.hideOptions).toHaveBeenCalledTimes(1);
    });
  });

  describe('componentWillUnmount', () => {
    it('should remove the event listeners', () => {
      instance.removeEventListeners = jest.fn();
      instance.componentWillUnmount();
      expect(instance.removeEventListeners).toHaveBeenCalledTimes(1);
    });
  });

  describe('stopPropagation', () => {
    it('should call stopPropagation on the provided event', () => {
      const e = {
        stopPropagation: jest.fn(),
      };
      instance.stopPropagation(e);
      expect(e.stopPropagation).toHaveBeenCalledTimes(1);
    });
  });

  describe('addEventListeners', () => {
    it('should setup the event listener to close the select on click outside the component', () => {
      window.addEventListener = jest.fn();
      instance.addEventListeners();
      expect(window.addEventListener).toHaveBeenCalledWith(
        'click',
        instance.onClickOutsideSelectBox,
        true,
      );
    });

    it('should setup the event listeners to resize/reposition the select on scroll and resize events', () => {
      window.addEventListener = jest.fn();
      instance.addEventListeners();
      expect(window.addEventListener).toHaveBeenCalledWith(
        'scroll',
        instance.efficientSetAbsoluteStyleCoordinates,
        true,
      );
      expect(window.addEventListener).toHaveBeenCalledWith(
        'resize',
        instance.efficientSetAbsoluteStyleCoordinates,
        true,
      );
    });
  });

  describe('removeEventListeners', () => {
    it('should cancel all the event listeners that were set up by addEventListeners', () => {
      const listeners = [];
      window.addEventListener = (...args) => listeners.push(args);
      window.removeEventListener = (...args) => listeners.splice(listeners.indexOf(args), 1);
      instance.addEventListeners();
      expect(listeners).toHaveLength(3);
      instance.removeEventListeners();
      expect(listeners).toHaveLength(0);
    });
  });

  describe('switchHighlightedOption', () => {
    it('should set highlightedIndex to the given index', () => {
      wrapper.setState({ highlightedIndex: 100 });
      instance.switchHighlightedOption(25);
      expect(wrapper.state('highlightedIndex')).toBe(25);
    });
  });

  describe('switchSelectedOption', () => {
    it('should always hide the options', () => {
      instance.hideOptions = jest.fn();
      instance.switchSelectedOption(0);
      expect(instance.hideOptions).toHaveBeenCalledTimes(1);
    });

    it('should trigger the onChange prop function with a synthetic event containing name and value', () => {
      const i = 2;
      instance.switchSelectedOption(i);
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith({
        target: {
          name,
          value: sampleOptions[i].value,
        },
      });
    });

    it('shouldnt trigger the onChange prop function if the newly selected option is the same as the current one', () => {
      // Select was initialized with 0
      instance.switchSelectedOption(0);
      expect(onChange).toHaveBeenCalledTimes(0);
    });
  });

  // In these tests the highlightedIndex at first is 0.
  describe('shiftHighlightedIndexBy', () => {
    it('should shift down if given 1', () => {
      const before = wrapper.state('highlightedIndex');
      instance.shiftHighlightedIndexBy(1);
      expect(wrapper.state('highlightedIndex')).toBe(before + 1);
    });

    it('should shift up if given -1', () => {
      instance.shiftHighlightedIndexBy(2); // Start at 2 instead of 0
      const before = wrapper.state('highlightedIndex');
      instance.shiftHighlightedIndexBy(-1);
      expect(wrapper.state('highlightedIndex')).toBe(before - 1);
    });

    it('should go to end if starting from 0 and given -1', () => {
      instance.shiftHighlightedIndexBy(-1);
      expect(wrapper.state('highlightedIndex')).toBe(sampleOptions.length - 1);
    });

    it('should go to 0 if starting from end and given 1', () => {
      wrapper.setState({ highlightedIndex: sampleOptions.length - 1 });
      instance.shiftHighlightedIndexBy(1);
      expect(wrapper.state('highlightedIndex')).toBe(0);
    });
  });

  describe('handleKeyboardShortcuts()', () => {
    it('should shift the highlighting up on UP ARROW (or show the options if hidden)', () => {
      // When this.state.open is false
      const preventDefault = jest.fn();
      instance.showOptions = jest.fn();
      instance.shiftHighlightedIndexBy = jest.fn();
      instance.handleKeyboardShortcuts({ preventDefault, which: 38 });
      expect(preventDefault).toHaveBeenCalledTimes(1);
      expect(instance.showOptions).toHaveBeenCalledTimes(1);
      expect(instance.shiftHighlightedIndexBy).toHaveBeenCalledTimes(0);

      preventDefault.mockClear();
      instance.showOptions.mockClear();
      wrapper.setState({ open: true });

      // When this.state.open is true
      instance.handleKeyboardShortcuts({ preventDefault, which: 38 });
      expect(preventDefault).toHaveBeenCalledTimes(1);
      expect(instance.showOptions).toHaveBeenCalledTimes(0);
      expect(instance.shiftHighlightedIndexBy).toHaveBeenCalledTimes(1);
      expect(instance.shiftHighlightedIndexBy).toHaveBeenCalledWith(-1);
    });

    it('should shift the highlighting down on DOWN ARROW (or show the options if hidden)', () => {
      // When this.state.open is false
      const preventDefault = jest.fn();
      instance.showOptions = jest.fn();
      instance.shiftHighlightedIndexBy = jest.fn();
      instance.handleKeyboardShortcuts({ preventDefault, which: 40 });
      expect(preventDefault).toHaveBeenCalledTimes(1);
      expect(instance.showOptions).toHaveBeenCalledTimes(1);
      expect(instance.shiftHighlightedIndexBy).toHaveBeenCalledTimes(0);

      preventDefault.mockClear();
      instance.showOptions.mockClear();
      wrapper.setState({ open: true });

      // When this.state.open is true
      instance.handleKeyboardShortcuts({ preventDefault, which: 40 });
      expect(preventDefault).toHaveBeenCalledTimes(1);
      expect(instance.showOptions).toHaveBeenCalledTimes(0);
      expect(instance.shiftHighlightedIndexBy).toHaveBeenCalledTimes(1);
      expect(instance.shiftHighlightedIndexBy).toHaveBeenCalledWith(1);
    });

    it('should select currently highlighted option on ENTER/RETURN key', () => {
      // When this.state.open is true
      wrapper.setState({ open: true });
      instance.switchSelectedOption = jest.fn();
      instance.handleKeyboardShortcuts({ preventDefault: () => { }, which: 13 });
      expect(instance.switchSelectedOption).toHaveBeenCalledTimes(1);

      instance.switchSelectedOption.mockClear();
      wrapper.setState({ open: false });

      // When this.state.open is false
      instance.handleKeyboardShortcuts({ preventDefault: () => { }, which: 13 });
      expect(instance.switchSelectedOption).toHaveBeenCalledTimes(0);
    });

    it('should hide the options on ESCAPE key', () => {
      // When this.state.open is true
      wrapper.setState({ open: true });
      instance.hideOptions = jest.fn();
      instance.handleKeyboardShortcuts({ preventDefault: () => { }, which: 27 });
      expect(instance.hideOptions).toHaveBeenCalledTimes(1);

      instance.hideOptions.mockClear();
      wrapper.setState({ open: false });

      // When this.state.open is false
      instance.handleKeyboardShortcuts({ preventDefault: () => { }, which: 27 });
      expect(instance.hideOptions).toHaveBeenCalledTimes(0);
    });

    it('if options are visible, should prevent moving focus away on TAB key', () => {
      // When this.state.open is true
      wrapper.setState({ open: true });
      const preventDefault = jest.fn();
      instance.handleKeyboardShortcuts({ preventDefault, which: 9 });
      expect(preventDefault).toHaveBeenCalledTimes(1);

      preventDefault.mockClear();
      wrapper.setState({ open: false });

      // When this.state.open is false
      instance.handleKeyboardShortcuts({ preventDefault, which: 9 });
      expect(preventDefault).toHaveBeenCalledTimes(0);
    });

    it('should hide options or select currently highlighted one on SPACE key', () => {
      // When this.state.open is true
      instance.switchSelectedOption = jest.fn();
      instance.showOptions = jest.fn();
      const preventDefault = jest.fn();
      wrapper.setState({ open: true });
      instance.handleKeyboardShortcuts({ preventDefault, which: 32 });
      expect(preventDefault).toHaveBeenCalledTimes(1);
      expect(instance.switchSelectedOption).toHaveBeenCalledTimes(1);
      expect(instance.showOptions).toHaveBeenCalledTimes(0);

      preventDefault.mockClear();
      instance.switchSelectedOption.mockClear();
      instance.showOptions.mockClear();
      wrapper.setState({ open: false });

      // When this.state.open is false
      instance.handleKeyboardShortcuts({ preventDefault, which: 32 });
      expect(preventDefault).toHaveBeenCalledTimes(1);
      expect(instance.switchSelectedOption).toHaveBeenCalledTimes(0);
      expect(instance.showOptions).toHaveBeenCalledTimes(1);
    });

    it('should do none of the above on other key events', () => {
      const preventDefault = jest.fn();
      instance.switchSelectedOption = jest.fn();
      instance.showOptions = jest.fn();
      instance.hideOptions = jest.fn();
      instance.shiftHighlightedIndexBy = jest.fn();
      instance.handleKeyboardShortcuts({ preventDefault, which: 1000 });
      expect(preventDefault).not.toBeCalled();
      expect(instance.switchSelectedOption).not.toBeCalled();
      expect(instance.showOptions).not.toBeCalled();
      expect(instance.hideOptions).not.toBeCalled();
      expect(instance.shiftHighlightedIndexBy).not.toBeCalled();
    });
  });
});

describe('<Select /> alternative branches', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(
      <Select
        name="Name"
        value=""
        labelText="Label"
        onChange={jest.fn()}
        options={sampleOptions}
        width={100}
        required
        displayComponent={option => <div>{option.name}</div>}
      />,
    );
  });

  it('renders', () => {
    expect(wrapper).toBeDefined();
    expect(wrapper.html()).not.toBeNull();
  });
});
