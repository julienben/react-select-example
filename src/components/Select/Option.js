import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import style from './Select.module.scss';

class Option extends React.Component {
  onClick = () => {
    this.props.switchSelectedOption(this.props.index);
  };

  onMouseEnter = () => {
    this.props.switchHighlightedOption(this.props.index);
  };

  render() {
    const classes = classNames({
      [style.highlightedOption]: this.props.highlightedOption,
      [style.selectedOption]: this.props.selectedOption,
    });
    return (
      <li className={classes} onMouseEnter={this.onMouseEnter} onClick={this.onClick}>
        {this.props.children ? this.props.children : this.props.name}
      </li>
    );
  }
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
