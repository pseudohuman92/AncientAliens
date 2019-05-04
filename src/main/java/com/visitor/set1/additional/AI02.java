/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package com.visitor.set1.additional;

import com.visitor.card.types.Activation;
import com.visitor.card.types.Item;
import com.visitor.card.types.Junk;
import com.visitor.game.Game;
import static com.visitor.protocol.Types.Knowledge.BLUE;
import com.visitor.set1.blue.UI04;
import com.visitor.helpers.Hashmap;
import com.visitor.helpers.Arraylist;
import java.util.UUID;


/**
 *
 * @author pseudo
 */
public class AI02 extends Item {
    
    public AI02 (UI04 c){
        super("AI02", 3, new Hashmap(BLUE, 3), 
                "Purge a Junk from your hand: Opponent Purges 5", c.controller);
        copyPropertiesFrom(c);
    }

    @Override
    public boolean canActivate(Game game) {
        return game.hasInstancesIn(controller, Junk.class, "hand", 1);
    }
    
    @Override
    public void activate(Game game) {
        Arraylist<UUID> selected = game.selectFromZone(controller, "hand", c -> {return c instanceof Junk;}, 1, false);
        game.purgeByID(controller, selected.get(0));
        game.addToStack(new Activation(controller, 
                game.getOpponentName(controller) + " purges 5",
                (x) -> { game.purge(game.getOpponentName(controller), 5); }));    }
}