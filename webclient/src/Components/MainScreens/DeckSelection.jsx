import React from "react";
import Grid from "@material-ui/core/Grid";
import Button from "../Primitives/Button";
import Center from "react-center";
import { connect } from "react-redux";

import { withFirebase } from "../Firebase";
import { mapDispatchToProps } from "../Redux/Store";
import ServerMessageHandler from "../MessageHandlers/ServerMessageHandler";
import GameScreen from './GameScreen';
import { withHandlers } from "../MessageHandlers/HandlerContext";
import {debugPrint, toDecklist} from "../Helpers/Helpers";
import { isProduction } from "../Helpers/Constants";
import * as proto from "../../protojs/compiled";
import {Redirect} from "react-router-dom";

const mapStateToProps = state => {
  return {
    userId: state.firebaseAuthData.user.uid,
  };
};

class DeckSelection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      decks: [],
      message: ""
    };
  }

  componentWillMount() {
    const Return = this.addDeck.bind(this);
    this.props.firebase.getAllDecks(this.props.userId, Return);
  }


  addDeck = deck => {
    this.setState((state, props) => ({ decks: state.decks.concat([deck]) }));
    debugPrint(deck);
  };

  loadDeck = (name, deck) => {
    debugPrint(deck);
    const decklist = toDecklist(deck);
    if (decklist) {
      this.props.serverHandler.joinQueue(proto.GameType.BO1_CONSTRUCTED, decklist);
    } else {
      this.setState({message: "Invalid Deck" });
    }
  };

  loadGame = event => {
    debugPrint("Loading Game");
    this.props.serverHandler.LoadGame("test_save");
    this.setState({message: "", value: 1 });
  };

  joinQueue = deckId => {
    debugPrint(deckId);
    const Return = this.loadDeck.bind(this);
    this.props.firebase.getDeck(deckId, Return);
  };


  render() {
    const {decks} = this.state;
    return (
        <div>
        {!isProduction && <Button onClick={this.loadGame} text="Load"/> } 
            <Grid container spacing={8}>
              {decks.map((deck, i) => (
                <Grid
                  item
                  key={i}
                  xs={4}
                  onDoubleClick={event => this.joinQueue(deck.id)}
                >
                  <Center>
                    <img
                      src={process.env.PUBLIC_URL + "/img/Logo.png"}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                      }}
                      alt=""
                    />
                  </Center>
                  <Center>{deck.name}</Center>
                </Grid>
              ))}
            </Grid>
            {this.state.message}
          </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withHandlers(withFirebase(DeckSelection)));
