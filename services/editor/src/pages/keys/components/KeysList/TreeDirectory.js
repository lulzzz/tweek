import React from 'react';
import PropTypes from 'prop-types';
import { VelocityTransitionGroup } from 'velocity-react';
import openedFolderIconSrc from './resources/Folder-icon-opened.svg';
import closedFolderIconSrc from './resources/Folder-icon-closed.svg';

class TreeDirectory extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    fullPath: PropTypes.string,
    depth: PropTypes.number.isRequired,
    children: PropTypes.arrayOf(PropTypes.node).isRequired,
    expandByDefault: PropTypes.bool,
  };

  constructor(props) {
    super(props);

    this.state = {
      isCollapsed: !props.selected && !props.expandByDefault,
    };
  }

  render() {
    let { fullPath, name, depth, children, descendantsCount } = this.props;
    let { isCollapsed } = this.state;

    return (
      <div className="key-folder">
        <div
          style={{ paddingLeft: (depth + 1) * 10 }}
          className="key-folder-name"
          onClick={() => this.setState({ isCollapsed: !isCollapsed })}
          data-folder-name={fullPath}
          data-is-collapsed={isCollapsed}
        >
          <img
            className="key-folder-icon"
            src={isCollapsed ? closedFolderIconSrc : openedFolderIconSrc}
            alt={''}
          />
          {name}
          <label className="number-of-folder-keys">{descendantsCount}</label>
        </div>

        <VelocityTransitionGroup
          enter={{ animation: 'slideDown' }}
          leave={{ animation: 'slideUp' }}
        >
          {isCollapsed ? (
            undefined
          ) : (
            <ul className="folder-items">
              {children.map((child, i) => (
                <li className="sub-tree" key={i}>
                  {child}
                </li>
              ))}
            </ul>
          )}
        </VelocityTransitionGroup>
      </div>
    );
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.selected && nextProps.selected) {
      this.setState({
        isCollapsed: false,
      });
    } else if (this.props.expandByDefault !== nextProps.expandByDefault && !this.props.selected) {
      this.setState({
        isCollapsed: !nextProps.expandByDefault,
      });
    }
  }
}

export default TreeDirectory;