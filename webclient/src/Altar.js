import React from 'react';

import {DropTarget} from 'react-dnd';

import Paper from '@material-ui/core/Paper';

import {ItemTypes} from './Constants.js';
import './Altar.css';

const altarTarget = {
  drop(props, monitor) {
    return {targetType: ItemTypes.ALTAR};
  },

  canDrop(props, monitor) {
    const item = monitor.getItem();
    return item.sourceType === ItemTypes.CARD && item.studyable;
  },
};

class Altar extends React.Component {
  render() {
    const {isOver, connectDropTarget, canDrop} = this.props;
    const style = {};
    if (isOver && canDrop) {
      style.border = '5px red solid';
    }

    return connectDropTarget(
      <div style={{height: '100%'}}>
        <Paper className="altar material-override" style={style} />
      </div>,
    );
  }
}

Altar = DropTarget(ItemTypes.CARD, altarTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop(),
}))(Altar);

export default Altar;
