/*
 *
 * Select
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
// import { debounce } from '../../utils/debounce';

import Option from './Option';
import style from '../Select/Select.module.scss';

const maxHeight = 250;

const getInitialState = (props) => ({
  open: false,
  highlightedIndex: 0,
  style: {
    top: 0,
    left: 0,
    width: 0,
    maxHeight: props.maxHeight || maxHeight,
  },
});

function reducer(state, action) {
  switch (action.type) {
    case 'SHOW_OPTIONS':
      return { ...state, open: true };
    case 'HIDE_OPTIONS':
      return { ...state, open: false };
    case 'SET_HIGHLIGHTED_INDEX':
      return { ...state, highlightedIndex: action.highlightedIndex }
    case 'UPDATE_STYLE':
      return { ...state, style: action.style };
    default:
      return state;
  }
}

function Select(props) {
  const [state, dispatch] = React.useReducer(reducer, getInitialState(props));
  const containerRef = React.useRef();
  const listRef = React.useRef();

  // On mount, set initial position and focus if necessary
  // On unmount, remove any leftover listeners
  React.useEffect(() => {
    if (props.autoFocus && !props.disabled) containerRef.current.focus();
    setAbsoluteStyleCoordinates();

    return () => removeEventListeners();
  }, []);

  // Hide options if they were open upon disable
  React.useEffect(() => {
    if (props.disabled) hideOptions();
  }, [props.disabled]);

  // Position options box right under the select box
  const setAbsoluteStyleCoordinates = () => {
    const dims = containerRef.current.getBoundingClientRect();
    dispatch({
      type: 'UPDATE_STYLE', style: {
        top: dims.top + dims.height,
        width: dims.width,
        left: dims.left,
        // Pick the smallest between props and distance to bottom of screen
        maxHeight: Math.min(
          window.innerHeight - dims.height - dims.top - 10,
          props.maxHeight || maxHeight,
        ),
      }
    })
  };

  const onScroll = (e) => {
    if (!listRef.current.isSameNode(e.target)) setAbsoluteStyleCoordinates();
  }

  // const efficientSetAbsoluteStyleCoordinates = debounce(setAbsoluteStyleCoordinates, 10);

  const scrollIntoView = index => {
    listRef.current.scrollTop = index * listRef.current.children[0].getBoundingClientRect().height;
  };

  const showOptions = () => {
    if (props.disabled) return;

    dispatch({ type: 'SHOW_OPTIONS' });
    setAbsoluteStyleCoordinates();
    addEventListeners();
  };

  const hideOptions = () => {
    dispatch({ type: 'HIDE_OPTIONS' });
    removeEventListeners();
  };

  const toggleOptions = e => {
    e.stopPropagation();
    if (state.open) hideOptions();
    else showOptions();
  };

  const switchHighlightedOption = i =>
    dispatch({ type: 'SET_HIGHLIGHTED_INDEX', highlightedIndex: i });

  const switchSelectedOption = i => {
    hideOptions();
    const newValue = props.options[i].value;
    if (props.value === newValue) return;
    props.onChange({
      target: {
        name: props.name,
        value: newValue,
      },
    });
  };

  const shiftHighlightedIndexBy = howMuch => {
    let newIndex = state.highlightedIndex + howMuch;
    const maxIndex = props.options.length - 1;
    if (newIndex < 0) newIndex = maxIndex;
    else if (newIndex > maxIndex) newIndex = 0;
    dispatch({ type: 'SET_HIGHLIGHTED_INDEX', highlightedIndex: newIndex });
    scrollIntoView(newIndex);
  };

  const handleKeyboardShortcuts = e => {
    let key = e.which;
    let testingKey = key;
    let letter;
    let findByLetter;
    let index;
    switch (true) {
      case key === 38: // Up
        e.preventDefault();
        if (state.open) shiftHighlightedIndexBy(-1);
        else showOptions();
        break;
      case key === 40: // Down
        e.preventDefault();
        if (state.open) shiftHighlightedIndexBy(1);
        else showOptions();
        break;
      case key === 13: // Enter
        if (state.open) switchSelectedOption(state.highlightedIndex);
        break;
      case key === 27: // Escape
        if (state.open) hideOptions();
        break;
      case key === 9: // Tab
        if (state.open) e.preventDefault();
        break;
      case key === 32: // Space
        e.preventDefault();
        if (state.open) switchSelectedOption(state.highlightedIndex);
        else showOptions();
        break;
      case key >= 65 && key <= 90: // A - Z
        findByLetter = option => option.name.charAt(0) === letter;
        do {
          letter = String.fromCharCode(testingKey);
          index = props.options.findIndex(findByLetter);

          // Until letter is found, move through alphabet one letter at a time
          if (testingKey === 90) {
            key -= 1;
            testingKey = key;
          } else testingKey += 1;
        } while (index === -1);
        switchHighlightedOption(index);
        scrollIntoView(index);
        break;
      default:
      // Do nothing.
    }
  };

  const stopPropagation = e => e.stopPropagation();

  const addEventListeners = () => {
    window.addEventListener('click', hideOptions, true);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', setAbsoluteStyleCoordinates, true);
  };

  const removeEventListeners = () => {
    window.removeEventListener('click', hideOptions, true);
    window.removeEventListener('scroll', onScroll, true);
    window.removeEventListener('resize', setAbsoluteStyleCoordinates, true);
  };

  const {
    width,
    labelText,
    labelColor,
    required,
    grey,
    disabled,
    options,
    value,
    placeholder,
    tabIndex,
    displayComponent,
  } = props;

  return (
    <div
      ref={containerRef}
      className={style.formInput}
      onClick={toggleOptions}
      onKeyDown={handleKeyboardShortcuts}
      style={width ? { width } : null}
    >
      <div className={style.labelRow} style={labelColor ? { color: labelColor } : {}}>
        <div className={style.labelText}>{labelText}</div>
        {required ? <div className={style.required}>Required</div> : null}
      </div>
      <div
        tabIndex={disabled ? -1 : tabIndex || 0}
        className={classNames(style.selectBox, {
          [style.selectBoxOpen]: state.open,
          [style.grey]: grey || disabled,
          [style.disabled]: disabled,
        })}
      >
        {value ? (
          <div className={classNames(style.content, style.selectedValue)}>
            {options.find(o => o.value === value).name}
          </div>
        ) : (
            <div className={classNames(style.content, style.placeholder)}>{placeholder || ''}</div>
          )}
        <div className={style.arrow}>
          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 17">
            <g />
            <path d="M13.207 8.472l-7.854 7.854-0.707-0.707 7.146-7.146-7.146-7.148 0.707-0.707 7.854 7.854z" />
          </svg>
        </div>
        <ul
          onClick={stopPropagation}
          className={style.selectOptions}
          style={state.style}
          ref={listRef}
        >
          {options.map((option, i) => (
            <Option
              key={option.value}
              index={i}
              name={option.name}
              switchSelectedOption={switchSelectedOption}
              switchHighlightedOption={switchHighlightedOption}
              selectedOption={value === option.value}
              highlightedOption={state.highlightedIndex === i}
            >
              {displayComponent ? displayComponent(option) : null}
            </Option>
          ))}
        </ul>
      </div>
    </div>
  );
}

Select.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  labelText: PropTypes.string.isRequired,
  labelColor: PropTypes.string,
  placeholder: PropTypes.string,
  autoFocus: PropTypes.bool,
  displayComponent: PropTypes.func,
  required: PropTypes.bool,
  tabIndex: PropTypes.number,
  width: PropTypes.number,
  maxHeight: PropTypes.number,
  grey: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default Select;
