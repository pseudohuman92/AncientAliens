/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.visitor.set1;


import com.visitor.card.types.Spell;
import com.visitor.card.types.Item;
import com.visitor.game.Game;
import static com.visitor.protocol.Types.Knowledge.BLACK;
import com.visitor.helpers.Hashmap;
import com.visitor.helpers.Arraylist;
import com.visitor.helpers.Predicates;
import java.util.UUID;

/**
 *
 * @author pseudo
 */
public class WeakLink extends Spell {
    
    /**
     *
     * @param owner
     */
    public WeakLink(String owner) {
        super("Weak Link", 2, new Hashmap(BLACK, 2), 
        "Opponent chooses an item he controls, posses that item.", owner);
    }
    
    @Override
    public boolean canPlay(Game game){ 
        return super.canPlay(game) && 
            game.hasInstancesIn(game.getOpponentName(controller), Item.class, "play", 1);
    }
    
    @Override
    public void resolveEffect (Game game){
        Arraylist<UUID> selected = game.selectFromZone(game.getOpponentName(controller), "play", Predicates::isItem, 1, false);
        game.possessTo(controller, selected.get(0), "play");
    }
}