/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package com.visitor.set1;


import com.visitor.card.types.Ability;
import com.visitor.card.types.Item;
import com.visitor.game.Game;
import static com.visitor.game.Game.Zone.PLAY;
import com.visitor.helpers.Hashmap;
import com.visitor.helpers.Predicates;
import static com.visitor.protocol.Types.Knowledge.BLACK;
import java.util.UUID;

/**
 *
 * @author pseudo
 */
public class HandofIllWill extends Item {
    
    UUID target;
    
    public HandofIllWill (String owner){
        super("Hand of Ill Will", 4, new Hashmap(BLACK, 3), 
        "Sacrifice an item, Activate:\n" +
        "Deal 2 damage to your opponent.\n" +
        "If sacrificed item belongs to him, deal 3 damage instead.", owner);
        subtypes.add("Weapon");
    }

    @Override
    public boolean canActivate(Game game) {
        return game.hasInstancesIn(controller, Item.class, PLAY, 1)&&(!depleted);
    }

    @Override
    public void activate(Game game) {
        target = game.selectFromZone(controller, PLAY, Predicates::isItem, 1, false).get(0);
        game.deplete(id);
        game.sacrifice(target);
        game.addToStack(new Ability(this, "deal " + (game.ownedByOpponent(target)? 3:2) +  
            " damage to " + game.getOpponentName(controller),
            (x) -> { game.dealDamage(id, target, (game.ownedByOpponent(target)?3:2)); }));
    }
}
