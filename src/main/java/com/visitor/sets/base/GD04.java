/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.visitor.sets.base;

import com.visitor.card.properties.Combat;
import com.visitor.card.properties.Triggering;
import com.visitor.card.types.Unit;
import com.visitor.card.types.helpers.AbilityCard;
import com.visitor.game.Card;
import com.visitor.game.Event;
import com.visitor.game.Game;
import com.visitor.helpers.Arraylist;
import com.visitor.helpers.CounterMap;
import com.visitor.sets.token.UnitToken;

import static com.visitor.protocol.Types.Knowledge.GREEN;
import static com.visitor.protocol.Types.Knowledge.RED;

/**
 * @author pseudo
 */
public class GD04 extends Unit {

	public GD04 (Game game, String owner) {
		super(game, "GD04",
				4, new CounterMap(GREEN, 2).add(RED, 1),
						"Whenever {~} attacks, {~} gains +X/+X where X is the number of attacking units you control.",
				1, 1,
				owner);

		triggering = new Triggering(game, this).addAttackChecker(this,
				event ->
					game.addToStack(new AbilityCard(game, this, "Whenever {~} attacks, {~} gains +X/+X where X is the number of attacking units you control.",
					() ->
						game.addAttackAndHealth(id, ((Arraylist<Card>)event.data.get(0)).size(), ((Arraylist<Card>)event.data.get(0)).size())
					))
		);
	}
}
