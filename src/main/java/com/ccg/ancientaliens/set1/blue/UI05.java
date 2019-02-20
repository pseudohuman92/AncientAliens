/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package com.ccg.ancientaliens.set1.blue;

import com.ccg.ancientaliens.card.types.Activation;
import com.ccg.ancientaliens.card.types.Card;
import com.ccg.ancientaliens.card.types.Item;
import com.ccg.ancientaliens.card.types.Junk;
import com.ccg.ancientaliens.game.Game;
import com.ccg.ancientaliens.game.Player;
import com.ccg.ancientaliens.helpers.UUIDHelper;
import static com.ccg.ancientaliens.protocol.Types.Knowledge.BLUE;
import helpers.Hashmap;
import java.util.ArrayList;
import java.util.UUID;


/**
 *
 * @author pseudo
 */
public class UI05 extends Item{
    
    public UI05 (String owner){
        super("UI05", 2, new Hashmap(BLUE, 2), 
                "1, Activate: Look at the top two cards of your deck. "
                + "Draw one, transform other into junk and shuffle into the deck.", owner);
    }

    @Override
    public boolean canActivate(Game game) {
        return !depleted && game.players.get(controller).energy > 0;
    }
    
    @Override
    public void activate(Game game) {
        game.deplete(id);
        game.spendEnergy(controller, 1);
        game.addToStack(new Activation(controller, 
                "Look at the top two cards of your deck. "
                + "Draw one, transform other into junk and shuffle into the deck.",
                (g , c) -> { 
                    Player p = g.players.get(c.controller);
                    ArrayList<Card> cand = p.deck.extractFromTop(2);
                    ArrayList<UUID> selected = g.selectFromListUpTo(controller, cand, UUIDHelper.toUUIDList(cand), 2);
                    p.hand.addAll(UUIDHelper.getInList(cand, selected));
                    Junk j = new Junk();
                    j.copyPropertiesFrom(UUIDHelper.getNotInList(cand, selected).get(0));
                    ArrayList<Card> cards = new ArrayList<>();
                    cards.add(j);
                    g.shuffleIntoDeck(j.controller, cards);
                }));
    }
}