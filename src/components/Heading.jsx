import React from 'react';
import PropTypes from 'prop-types';

const levelMap = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
  4: 'h4',
  5: 'h5',
  6: 'h6',
};

const variantStyles = {
  main: 'font-bold text-3xl',
  sub: 'font-semibold text-xl',
  section: 'font-medium text-lg',
};

const Heading = ({
  level = 1,
  children,
  variant = 'main',
  className = '',
  style = {},
  ...rest
}) => {
  const Tag = levelMap[level] || 'h1';
  const variantClass = variantStyles[variant] || '';
  return (
    <Tag className={`${variantClass} ${className}`.trim()} style={style} {...rest}>
      {children}
    </Tag>
  );
};

Heading.propTypes = {
  level: PropTypes.oneOf([1, 2, 3, 4, 5, 6]),
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['main', 'sub', 'section']),
  className: PropTypes.string,
  style: PropTypes.object,
};

export default Heading; 