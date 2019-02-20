/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package com.ccg.ancientaliens.set1.black;

import com.ccg.ancientaliens.card.types.Activation;
import com.ccg.ancientaliens.card.types.Item;
import com.ccg.ancientaliens.game.Game;
import static com.ccg.ancientaliens.protocol.Types.Knowledge.BLACK;
import helpers.Hashmap;

/**
 *
 * @author pseudo
 */
public class BI06 extends Item {
    
    public BI06 (String owner){
        super("BI06", 1, new Hashmap(BLACK, 1), 
                "Condition - Control a card you don't own. Activate: Opponent purges 3.", owner);
    }

    @Override
    public boolean canActivate(Game game) {
        return !depleted && game.controlsUnownedCard(controller);
    }

    @Override
    public void activate(Game game) {
        game.deplete(id);
        game.addToStack(new Activation ("", controller,
            "Opponent purges 3",
            null, (g, c) -> {
                g.purge(g.getOpponentName(c.controller), 3);
            }));
    }
}