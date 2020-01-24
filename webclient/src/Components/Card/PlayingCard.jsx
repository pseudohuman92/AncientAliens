import React from "react";
import { connect } from "react-redux";

import CardDisplay from "./CardDisplay";
import { keywords, ClientPhase } from "../Helpers/Constants";

import proto, { BlockerAssignment } from "../../protojs/compiled.js";
import { mapDispatchToProps } from "../Redux/Store";
import { withHandlers } from "../MessageHandlers/HandlerContext";
import FittedText from "../Primitives/FittedText";
import { ArcherElement } from "react-archer";
import { Draggable } from "react-beautiful-dnd";

const mapStateToProps = state => {
  return {
    clientPhase: state.extendedGameState.clientPhase,
    windowDimensions: state.windowDimensions,

    playableCards: state.extendedGameState.game.canPlay,
    studyableCards: state.extendedGameState.game.canStudy,
    activatableCards: state.extendedGameState.game.canActivate,
    attackers: state.extendedGameState.game.attackers,
    blockers: state.extendedGameState.game.blockers,

    selectionData: state.extendedGameState.selectionData,
    attackerAssignmentData: state.extendedGameState.attackerAssignmentData,
    blockerAssignmentData: state.extendedGameState.blockerAssignmentData
  };
};

class PlayingCard extends React.Component {
  constructor(props) {
    super(props);
    var relations = [];
    if (this.shouldCalculateArrows(props)) {
      relations = this.getArrowRelations();
    }
    this.state = {
      popoverStyle: { display: "none", width: 0 },
      arrowRelations: relations,
      showArrows: false
    };
  }

  

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.shouldRecalculateArrows(prevProps)) {
      var relations = this.getArrowRelations();
      this.setState({
        arrowRelations: relations
      });
    }
  }

  onMouseEnter = event => {
    if (this.props.cardData.targets.length !== 0) {
      this.setState({ showArrows: true });
    }
    this.handlePopoverOpen(event);
  };

  onMouseLeave = event => {
    if (this.props.cardData.targets.length !== 0) {
      this.setState({ showArrows: false });
    }
    this.handlePopoverClose(event);
  };

  handlePopoverOpen = event => {
    const { width, height } = this.props.windowDimensions;
    var rect = event.currentTarget.getBoundingClientRect();

    var style = {};
    style["width"] = width / 5;
    style["height"] = (width / 5) * (88/63);
    style["display"] = "flex";
    style["textAlign"] = "left";

    if (rect.top < height / 2) {
      style["top"] = rect.height;
    } else {
      style["bottom"] = rect.height;
    }

    if (rect.left < width / 2) {
      style["left"] = rect.width;
    } else {
      style["right"] = rect.width;
      style["flexDirection"] = "row-reverse";
    }
    this.setState({
      popoverStyle: style
    });
  };

  handlePopoverClose = event => {
    this.setState({ popoverStyle: { display: "none", width: 0 } });
  };

  //! ///// Attack Handlers /////////

  setAttacking = event => {
    let id = this.props.cardData.id;

    let attackerAssignments = [
      ...this.props.attackerAssignmentData.attackerAssignments
    ];
    let possibleAttackers = this.props.attackerAssignmentData.possibleAttackers;
    let possibleAttackerIds = possibleAttackers.map(a => {
      return a.attackerId;
    });
    let possibleAttackerEntry =
      possibleAttackers[possibleAttackerIds.indexOf(id)];
    let possibleAttackTargets = possibleAttackerEntry.possibleAttackTargets;

    if (possibleAttackTargets.length === 1) {
      attackerAssignments.push({
        attackerId: id,
        attacksTo: possibleAttackTargets[0]
      });
      this.props.updateExtendedGameState({
        attackerAssignmentData: {
          currentAttacker: "",
          possibleAttackTargets: [],
          attackerAssignments: attackerAssignments
        }
      });
    } else {
      this.props.updateExtendedGameState({
        attackerAssignmentData: {
          currentAttacker: id,
          possibleAttackTargets: possibleAttackTargets
        }
      });
    }
  };

  unsetAttacking = event => {
    let id = this.props.cardData.id;
    let attackerAssignments = [
      ...this.props.attackerAssignmentData.attackerAssignments
    ];
    let attackerAssignmentIds = attackerAssignments.map(a => {
      return a.attackerId;
    });

    if (attackerAssignmentIds.indexOf(id) > -1) {
      attackerAssignments.splice(attackerAssignmentIds.indexOf(id), 1);
    }

    this.props.updateExtendedGameState({
      attackerAssignmentData: {
        currentAttacker: "",
        possibleAttackTargets: [],
        attackerAssignments: attackerAssignments
      }
    });
  };

  setAttacked = event => {
    let id = this.props.cardData.id;

    let attackerAssignments = [
      ...this.props.attackerAssignmentData.attackerAssignments
    ];
    let currentAttacker = this.props.attackerAssignmentData.currentAttacker;

    attackerAssignments.push({ attackerId: currentAttacker, attacksTo: id });
    this.props.updateExtendedGameState({
      attackerAssignmentData: {
        currentAttacker: "",
        possibleAttackTargets: [],
        attackerAssignments: attackerAssignments
      }
    });
  };

  //! /////// Block Handlers /////////

  setBlocking = event => {
    let id = this.props.cardData.id;

    let blockerAssignments = [
      ...this.props.blockerAssignmentData.blockerAssignments
    ];
    let possibleBlockers = this.props.blockerAssignmentData.possibleBlockers;
    let possibleBlockerIds = possibleBlockers.map(a => {
      return a.blockerId;
    });
    let possibleBlockerEntry = possibleBlockers[possibleBlockerIds.indexOf(id)];
    let possibleBlockTargets = possibleBlockerEntry.possibleBlockTargets;

    if (possibleBlockTargets.length === 1) {
      blockerAssignments.push({
        blockerId: id,
        blockedBy: possibleBlockTargets[0]
      });
      this.props.updateExtendedGameState({
        blockerAssignmentData: {
          currentBlocker: "",
          possibleBlockTargets: [],
          blockerAssignments: blockerAssignments
        }
      });
    } else {
      this.props.updateExtendedGameState({
        blockerAssignmentData: {
          currentBlocker: id,
          possibleBlockTargets: possibleBlockTargets
        }
      });
    }
  };

  unsetBlocking = event => {
    let id = this.props.cardData.id;
    let blockerAssignments = [
      ...this.props.blockerAssignmentData.blockerAssignments
    ];
    let blockerAssignmentIds = blockerAssignments.map(a => {
      return a.blockerId;
    });

    if (blockerAssignmentIds.indexOf(id) > -1) {
      blockerAssignments.splice(blockerAssignmentIds.indexOf(id), 1);
    }

    this.props.updateExtendedGameState({
      blockerAssignmentData: {
        currentBlocker: "",
        possibleBlockTargets: [],
        blockerAssignments: blockerAssignments
      }
    });
  };

  setBlocked = event => {
    let id = this.props.cardData.id;

    let blockerAssignments = [
      ...this.props.blockerAssignmentData.blockerAssignments
    ];
    let currentBlocker = this.props.blockerAssignmentData.currentBlocker;

    blockerAssignments.push({ blockerId: currentBlocker, blockedBy: id });
    this.props.updateExtendedGameState({
      blockerAssignmentData: {
        currentBlocker: "",
        possibleBlockTargets: [],
        blockerAssignments: blockerAssignments
      }
    });
  };

  //! /////// Selection Handlers ///////////

  select = event => {
    let id = this.props.cardData.id;
    let selected = [...this.props.selectionData.selected];
    let maxCount = this.props.selectionData.selectionCount;
    let clientPhase = this.props.clientPhase;

    if (selected.length < maxCount) {
      selected.push(id);
      this.props.updateExtendedGameState({
        selectionData: {
          selected: selected
        }
      });
    }
    if (selected.length === maxCount) {
      this.props.gameHandler.SelectDone(clientPhase, selected);
    }
  };

  unselect = event => {
    let id = this.props.cardData.id;
    let selected = [...this.props.selectionData.selected];

    if (selected.includes(id)) {
      selected.splice(selected.indexOf(id), 1);
      this.props.updateExtendedGameState({
        selectionData: {
          selected: selected
        }
      });
    }
  };

  //! //// Connection Arrows //////

  shouldCalculateArrows = (props) => {
    let id = props.cardData.id;
    let targets = props.cardData.targets;
    let attackerAssignments = props.attackerAssignmentData.attackerAssignments;
    let attackerIndex = attackerAssignments.map(a => {
      return a.attackerId;
    }).indexOf(id);
    let blockerAssignments = props.blockerAssignmentData.blockerAssignments;
    let blockerIndex = blockerAssignments.map(a => {
      return a.blockerId;
    }).indexOf(id);

    return targets.length > 0 || attackerIndex > -1 || blockerIndex > -1;
  }

  //! TODO: finish this first!!!! 
  shouldRecalculateArrows = (prevProps) => {
    
    let id = this.props.cardData.id;

    let prevTargets = prevProps.cardData.targets;
    let prevAttackerAssignments = prevProps.attackerAssignmentData.attackerAssignments;
    let prevAttackerIndex = prevAttackerAssignments.map(a => {
      return a.attackerId;
    }).indexOf(id);
    let prevBlockerAssignments = prevProps.blockerAssignmentData.blockerAssignments;
    let prevBlockerIndex = prevBlockerAssignments.map(a => {
      return a.blockerId;
    }).indexOf(id);

    let targets = this.props.cardData.targets;
    let attackerAssignments = this.props.attackerAssignmentData.attackerAssignments;
    let attackerIndex = attackerAssignments.map(a => {
      return a.attackerId;
    }).indexOf(id);
    let blockerAssignments = this.props.blockerAssignmentData.blockerAssignments;
    let blockerIndex = blockerAssignments.map(a => {
      return a.blockerId;
    }).indexOf(id);

    return JSON.stringify(prevTargets) !== JSON.stringify(targets) ||
    (prevAttackerIndex === -1 && attackerIndex !== -1) ||
    (prevAttackerIndex !== -1 && attackerIndex === -1) ||
    (prevBlockerIndex === -1 && blockerIndex !== -1) ||
    (prevBlockerIndex !== -1 && blockerIndex === -1);
    
  }

  getArrowRelations = () => {
    let id = this.props.cardData.id;
    let targets = this.props.cardData.targets;
    let attackerAssignments = this.props.attackerAssignmentData.attackerAssignments;
    let attackerAssignmentIds = attackerAssignments.map(a => {
      return a.attackerId;
    });
    let blockerAssignments = this.props.blockerAssignmentData.blockerAssignments;
    let blockerAssignmentIds = blockerAssignments.map(a => {
      return a.blockerId;
    });

    /* {
      targetId: string,
      targetAnchor: 'top' | 'bottom' | 'left' | 'right' | 'middle',
      sourceAnchor: 'top' | 'bottom' | 'left' | 'right' | 'middle',
      label: React.Node,
      style: Style,
    } : Relation */
    let relations = [];
    
    targets.forEach(target => {
      relations.push({
        targetId: target,
        targetAnchor: "middle",
        sourceAnchor: "middle",
        style: {
          strokeColor: "yellow",
          strokeWidth: 4,
          noCurves: true
        }
      });
    });

    // if card is attacking
    const attackerIndex = attackerAssignmentIds.indexOf(id);
    if ( attackerIndex > -1) {
      const attackerAssignment = attackerAssignments[attackerIndex];
      relations.push({
        targetId: attackerAssignment.attacksTo,
        targetAnchor: "middle",
        sourceAnchor: "middle",
        style: {
          strokeColor: "red",
          strokeWidth: 4,
          noCurves: false
        }
      });
    }


    // If card is blocking 
    const blockerIndex = blockerAssignmentIds.indexOf(id);
    if ( blockerIndex > -1) {
      const blockerAssignment = blockerAssignments[blockerIndex];
      relations.push({
        targetId: blockerAssignment.blockedBy,
        targetAnchor: "middle",
        sourceAnchor: "middle",
        style: {
          strokeColor: "blue",
          strokeWidth: 4,
          noCurves: false
        }
      });
    }

    console.log("Relations", relations);
    return relations;
  };

  //! Rendering //////
  render() {
    const {
      clientPhase,
      DnDIndex,
      isDragDisabled,
      windowDimensions,

      selectionData,
      attackerAssignmentData,
      blockerAssignmentData,

      activatableCards,
      playableCards,
      studyableCards,
      attackers,
      blockers,

      gameHandler,
      small,
      square,
      style,
      cardData,
      popoverDisabled
    } = this.props;

    const { id, depleted, deploying } = cardData;
    const { arrowRelations, showArrows } = this.state;

    const activatable = activatableCards.includes(id);
    const studyable = studyableCards.includes(id);
    const playable = playableCards.includes(id);
    const selectable_ =  selectionData.selectable.includes(id);
    const selected_ = selectionData.selected.includes(id);

    const attacking =
      (clientPhase === ClientPhase.SELECT_ATTACKERS ||
        clientPhase === ClientPhase.SELECT_BLOCKERS ||
        clientPhase === ClientPhase.UPDATE_GAME) &&
      (attackerAssignmentData.attackerAssignments
        .map(c => {
          return c.attackerId;
        })
        .includes(id) ||
        attackerAssignmentData.currentAttacker === id ||
        attackers.includes(id));
    const canAttack =
      !attacking &&
      !attackerAssignmentData.currentAttacker &&
      clientPhase === ClientPhase.SELECT_ATTACKERS &&
      attackerAssignmentData.possibleAttackers
        .map(c => {
          return c.attackerId;
        })
        .includes(id);
    const canBeAttacked =
      clientPhase === ClientPhase.SELECT_ATTACKERS &&
      attackerAssignmentData.currentAttacker &&
      attackerAssignmentData.possibleAttackTargets.includes(id);

    const blocking =
      (clientPhase === ClientPhase.SELECT_ATTACKERS ||
        clientPhase === ClientPhase.SELECT_BLOCKERS ||
        clientPhase === ClientPhase.UPDATE_GAME) &&
      (blockerAssignmentData.blockerAssignments
        .map(c => {
          return c.blockerId;
        })
        .includes(id) ||
        blockerAssignmentData.currentBlocker === id ||
        blockers.includes(id));
    const canBlock =
      !blocking &&
      !blockerAssignmentData.currentBlocker &&
      clientPhase === ClientPhase.SELECT_BLOCKERS &&
      blockerAssignmentData.possibleBlockers
        .map(c => {
          return c.blockerId;
        })
        .includes(id);
    const canBeBlocked =
      clientPhase === ClientPhase.SELECT_BLOCKERS &&
      blockerAssignmentData.currentBlocker &&
      blockerAssignmentData.possibleBlockTargets.includes(id);

    var borderColor = "";
    if (
      canAttack ||
      canBeAttacked ||
      canBlock ||
      canBeBlocked ||
      selectable_ ||
      activatable ||
      playable
    ) {
      borderColor = "green";
    } else if (attacking) {
      borderColor = "red";
    } else if (selected_ || blocking) {
      borderColor = "blue";
    }

    let clickHandler = undefined;
    if (canAttack) {
      clickHandler = this.setAttacking;
      console.log("Set Attacking");
    } else if (attacking && clientPhase === ClientPhase.SELECT_ATTACKERS) {
      clickHandler = this.unsetAttacking;
      console.log("Unset Attacking");
    } else if (canBeAttacked) {
      clickHandler = this.setAttacked;
    } else if (canBlock) {
      clickHandler = this.setBlocking;
      console.log("Set Blocking");
    } else if (blocking && clientPhase === ClientPhase.SELECT_BLOCKERS) {
      clickHandler = this.unsetBlocking;
      console.log("Unset Blocking");
    } else if (canBeBlocked) {
      clickHandler = this.setBlocked;
    } else if (selected_) {
      clickHandler = this.unselect;
    } else if (selectable_) {
      clickHandler = this.select;
    } else if (activatable) {
      clickHandler = event => {
        gameHandler.ActivateCard(id);
      };
    }

    var opacity = 1;
    if (deploying) {
      opacity = 0.5;
    }

    var rotation = "rotate(0deg)";
    if (depleted) {
      rotation = "rotate(7.5deg)";
    }

    const counterMap = {};
    counterMap[proto.Counter.CHARGE] = "C";

    const { popoverStyle } = this.state;

    let draggableId = id;
    if (studyable) {
      draggableId = "[STUDYABLE]"+draggableId;
    }
    if (playable) {
      draggableId= "[PLAYABLE]"+draggableId;
    }

    return (
      <Draggable draggableId={draggableId} index={DnDIndex} isDragDisabled={isDragDisabled || (!playable && !studyable)} >
        {(provided, snapshot) => {
          const isDragging = snapshot.isDragging;
          return (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              onMouseEnter={this.onMouseEnter}
              onMouseLeave={this.onMouseLeave}
              style={{
                //width: "100%",
                //height: "100%",
                ...style,
                //width: width / 5,
                //height: height / 3,
                position: "relative"
              }}
            >
              {!isDragging && !popoverDisabled && (
                <div
                  style={{
                    position: "absolute",
                    zIndex: 20,
                    ...popoverStyle
                  }}
                >
                  <div style={{ width: popoverStyle.width / 2, height: popoverStyle.height }}>
                    <CardDisplay
                      cardData={cardData}
                      windowDimensions={windowDimensions}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      width: popoverStyle.width / 2,
                      height: popoverStyle.height
                    }}
                  >
                    {cardData.description &&
                      Object.keys(keywords).map((keyword, i) => {
                        if (cardData.description.indexOf(keyword) !== -1) {
                          return (
                            <div
                              key={i}
                              style={{
                                color: "white",
                                backgroundColor: "black",
                                border: "1px white solid",
                                borderRadius: "5px",
                                whiteSpace: "pre-wrap"
                              }}
                            >
                              <FittedText
                                text={keyword + "\n" + keywords[keyword]}
                                windowDimensions={windowDimensions}
                              />
                            </div>
                          );
                        }
                        return <div key={i} />;
                      })}
                  </div>
                </div>
              )}
              <div {...provided.dragHandleProps}>
                <ArcherElement
                  id={id}
                  relations={showArrows ? arrowRelations : []}
                  style={{ zIndex: 10 }}
                >
                  <CardDisplay
                    opacity={opacity}
                    borderColor={borderColor}
                    onClick={clickHandler}
                    small={small}
                    square={square}
                    style={{ transform: rotation }}
                    cardData={cardData}
                    windowDimensions={windowDimensions}
                  />
                </ArcherElement>
              </div>
            </div>
          );
        }}
      </Draggable>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withHandlers(PlayingCard));
