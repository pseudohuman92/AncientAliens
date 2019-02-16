import {GameProtoSocket} from './ProtoSocket.js';

export const GamePhases = {
  NOT_STARTED: 'NotStarted',
  UPDATE_GAME: 'UpdateGame',
  WIN: 'Win',
  LOSE: 'Lose',
  ORDER_CARDS: 'OrderCards',
  SELECT_FROM_LIST: 'SelectFromList',
  SELECT_FROM_PLAY: 'SelectFromPlay',
  SELECT_FROM_HAND: 'SelectFromHand',
  SELECT_FROM_SCRAPYARD: 'SelectFromScrapyard',
  SELECT_FROM_VOID: 'SelectFromVoid',
  SELECT_PLAYER: 'SelectPlayer',
  DONE_SELECT: 'DoneSelect',
};

export function IsSelectCardPhase(phase) {
  return [
    GamePhases.SELECT_FROM_LIST,
    GamePhases.SELECT_FROM_PLAY,
    GamePhases.SELECT_FROM_HAND,
    GamePhases.SELECT_FROM_SCRAPYARD,
    GamePhases.SELECT_FROM_VOID,
  ].includes(phase);
}

export class GameState {
  constructor() {
    this.protoSocket = null;
    // This is the handler which will be called whenever the game state
    // changes.
    this.updateViewHandler = null;
    this.lastMsg = null;
    this.phase = null;
  }

  handleMsg = (msgType, params) => {
    // XXX Remember to update this with the protocol updates
    const phase = {
      UpdateGameState: GamePhases.UPDATE_GAME,
      Loss: GamePhases.LOSS,
      Win: GamePhases.WIN,
      OrderCards: GamePhases.ORDER_CARDS,
      SelectFromList: GamePhases.SELECT_FROM_LIST,
      SelectFromPlay: GamePhases.SELECT_FROM_PLAY,
      SelectFromHand: GamePhases.SELECT_FROM_HAND,
      SelectFromScrapyard: GamePhases.SELECT_FROM_SCRAPYARD,
      SelectFromVoid: GamePhases.SELECT_FROM_VOID,
      SelectPlayer: GamePhases.SELECT_PLAYER,
    }[msgType];
    this.lastMsg = params;
    this.phase = phase;
    this.selectedCards = [];

    if (phase === GamePhases.SELECT_FROM_HAND) {
      params.candidates = params.game.player.hand;
    }
    this.updateViewHandler(params, phase, null);
  };

  send(msgType, params) {
    this.protoSocket.send(msgType, params);
  }
}

const gameState = new GameState();

export function InitiateConnection(url) {
  gameState.protoSocket = new GameProtoSocket(url, gameState.handleMsg);
}

export function SetBasicGameInfo(gameID, me, gary) {
  gameState.gameID = gameID;
  gameState.me = me;
  gameState.gary = gary;
}

export function RegisterUpdateGameHandler(updateViewHandler) {
  gameState.updateViewHandler = updateViewHandler;
}

export function Pass() {
  gameState.send('Pass', {gameID: gameState.gameID, username: gameState.me});
}

export function SetGameInfo(newInfo) {
  Object.keys(newInfo).forEach(i => {
    gameState[i] = newInfo[i];
  });
}

export function Mulligan() {
  gameState.send('Mulligan', {
    gameID: gameState.gameID,
    username: gameState.me,
  });
}

export function Keep() {
  gameState.send('Keep', {
    gameID: gameState.gameID,
    username: gameState.me,
  });
}

export function Concede() {
  gameState.send('Concede', {
    gameID: gameState.gameID,
    username: gameState.me,
  });
}

export function PlayCard(cardID) {
  gameState.send('PlayCard', {
    gameID: gameState.gameID,
    username: gameState.me,
    cardID: cardID,
  });
}

export function ActivateCard(cardID) {
  gameState.send('ActivateCard', {
    gameID: gameState.gameID,
    username: gameState.me,
    cardID: cardID,
  });
}

export function StudyCard(cardID) {
  gameState.send('StudyCard', {
    gameID: gameState.gameID,
    username: gameState.me,
    cardID: cardID,
    knowledge: [],
  });
}

export function SelectCard(cardID) {
  const selectCount = gameState.lastMsg.selectionCount;
  gameState.selectedCards.push(cardID);
  if (gameState.selectedCards.length === selectCount) {
    gameState.send(gameState.phase + 'Response', {
      gameID: gameState.gameID,
      selectedCards: gameState.selectedCards,
    });
    gameState.selectedCards = [];
    gameState.phase = GamePhases.DONE_SELECT;
  }
  gameState.updateViewHandler(
    gameState.lastMsg,
    gameState.phase,
    gameState.selectedCards,
  );
}