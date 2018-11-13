import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import style from '../Select/Select.module.scss';

function Option(props) {
  function onClick() {
    props.switchSelectedOption(props.index);
  };

  function onMouseEnter() {
    props.switchHighlightedOption(props.index);
  };

  const classes = classNames({
    [style.highlightedOption]: props.highlightedOption,
    [style.selectedOption]: props.selectedOption,
  });

  return (
    <li className={classes} onMouseEnter={onMouseEnter} onClick={onClick}>
      {props.children ? props.children : props.name}
    </li>
  );
}

Option.propTypes = {
  name: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  children: PropTypes.node,
  selectedOption: PropTypes.bool,
  highlightedOption: PropTypes.bool,
  switchSelectedOption: PropTypes.func.isRequired,
  switchHighlightedOption: PropTypes.func.isRequired,
};

export default Option;
