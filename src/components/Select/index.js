/*
 *
 * Select
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { debounce } from '../../utils/debounce';

import Option from './Option';
import style from './Select.module.scss';

class Select extends React.Component {
  maxHeight = 250;

  state = {
    open: false,
    highlightedIndex: 0,
    style: {
      top: 0,
      left: 0,
      width: 0,
      maxHeight: this.props.maxHeight || this.maxHeight,
    },
  };

  componentDidMount() {
    if (this.props.autoFocus && !this.props.disabled) this.domNode.focus();
    this.setAbsoluteStyleCoordinates();
  }

  componentWillReceiveProps(nextProps) {
    // Hide options if they were open upon disable
    if (!this.props.disabled && nextProps.disabled) this.hideOptions();
  }

  // Position options box right under the select box
  setAbsoluteStyleCoordinates = () => {
    const dims = this.domNode.getBoundingClientRect();
    this.setState({
      style: {
        top: dims.top + dims.height,
        width: dims.width,
        left: dims.left,
        // Pick the smallest between props and distance to bottom of screen
        maxHeight: Math.min(
          window.innerHeight - dims.height - dims.top - 10,
          this.props.maxHeight || this.maxHeight,
        ),
      },
    });
  };

  efficientSetAbsoluteStyleCoordinates = debounce(this.setAbsoluteStyleCoordinates, 10);

  // Show or hide the list of options
  toggleOptions = e => {
    e.stopPropagation();
    if (this.state.open) this.hideOptions();
    else this.showOptions();
  };

  showOptions = () => {
    if (this.props.disabled) return;
    this.setState(
      {
        open: true,
        // highlightedIndex: 0,
      },
      () => {
        this.setAbsoluteStyleCoordinates();
        this.addEventListeners();
      },
    );
  };

  hideOptions = () => {
    this.setState(
      {
        open: false,
        // highlightedIndex: 0,
      },
      () => {
        this.removeEventListeners();
      },
    );
  };

  onClickOutsideSelectBox = () => {
    // Timeout ensures that the select isnt reopened by toggleOptions (given two handlers on same event)
    setTimeout(this.hideOptions, 0);
  };

  componentWillUnmount() {
    this.removeEventListeners();
  }

  addEventListeners = () => {
    window.addEventListener('click', this.onClickOutsideSelectBox, true);
    window.addEventListener('scroll', this.efficientSetAbsoluteStyleCoordinates, true);
    window.addEventListener('resize', this.efficientSetAbsoluteStyleCoordinates, true);
  };

  removeEventListeners = () => {
    window.removeEventListener('click', this.onClickOutsideSelectBox, true);
    window.removeEventListener('scroll', this.efficientSetAbsoluteStyleCoordinates, true);
    window.removeEventListener('resize', this.efficientSetAbsoluteStyleCoordinates, true);
  };

  switchHighlightedOption = i => this.setState({ highlightedIndex: i });

  switchSelectedOption = i => {
    this.hideOptions();
    const newValue = this.props.options[i].value;
    if (this.props.value === newValue) return;
    // Mimic real HTML select behavior for easy swapping
    this.props.onChange({
      target: {
        name: this.props.name,
        value: newValue,
      },
    });
  };

  shiftHighlightedIndexBy = howMuch => {
    let newIndex;
    this.setState(
      prevState => {
        newIndex = prevState.highlightedIndex + howMuch;
        const maxIndex = this.props.options.length - 1;
        if (newIndex < 0) newIndex = maxIndex;
        else if (newIndex > maxIndex) newIndex = 0;
        return { highlightedIndex: newIndex };
      },
      () => {
        this.scrollIntoView(newIndex);
      },
    );
  };

  scrollIntoView = index => {
    this.listNode.scrollTop = index * this.listNode.children[0].getBoundingClientRect().height;
  };

  // Imitate the behavior of the native select control
  handleKeyboardShortcuts = e => {
    let key = e.which;
    let testingKey = key;
    let letter;
    let findByLetter;
    let index;
    switch (true) {
      case key === 38: // Up
        e.preventDefault();
        if (this.state.open) this.shiftHighlightedIndexBy(-1);
        else this.showOptions();
        break;
      case key === 40: // Down
        e.preventDefault();
        if (this.state.open) this.shiftHighlightedIndexBy(1);
        else this.showOptions();
        break;
      case key === 13: // Enter
        if (this.state.open) this.switchSelectedOption(this.state.highlightedIndex);
        break;
      case key === 27: // Escape
        if (this.state.open) this.hideOptions();
        break;
      case key === 9: // Tab
        if (this.state.open) e.preventDefault();
        break;
      case key === 32: // Space
        e.preventDefault();
        if (this.state.open) this.switchSelectedOption(this.state.highlightedIndex);
        else this.showOptions();
        break;
      case key >= 65 && key <= 90: // A - Z
        findByLetter = option => option.name.charAt(0) === letter;
        do {
          letter = String.fromCharCode(testingKey);
          index = this.props.options.findIndex(findByLetter);

          // Until letter is found, move through alphabet one letter at a time
          if (testingKey === 90) {
            key -= 1;
            testingKey = key;
          } else testingKey += 1;
        } while (index === -1);
        this.switchHighlightedOption(index);
        this.scrollIntoView(index);
        break;
      default:
      // Do nothing.
    }
  };

  stopPropagation = e => e.stopPropagation();

  render() {
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
    } = this.props;
    return (
      <div
        ref={node => {
          this.domNode = node;
        }}
        className={style.formInput}
        onClick={this.toggleOptions}
        onKeyDown={this.handleKeyboardShortcuts}
        style={width ? { width } : null}
      >
        <div className={style.labelRow} style={labelColor ? { color: labelColor } : {}}>
          <div className={style.labelText}>{labelText}</div>
          {required ? <div className={style.required}>Required</div> : null}
        </div>
        <div
          tabIndex={disabled ? -1 : tabIndex || 0}
          className={classNames(style.selectBox, {
            [style.selectBoxOpen]: this.state.open,
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
            onClick={this.stopPropagation}
            className={style.selectOptions}
            style={this.state.style}
            ref={node => {
              this.listNode = node;
            }}
          >
            {options.map((option, i) => (
              <Option
                key={option.value}
                index={i}
                name={option.name}
                switchSelectedOption={this.switchSelectedOption}
                switchHighlightedOption={this.switchHighlightedOption}
                selectedOption={value === option.value}
                highlightedOption={this.state.highlightedIndex === i}
              >
                {displayComponent ? displayComponent(option) : null}
              </Option>
            ))}
          </ul>
        </div>
      </div>
    );
  }
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
