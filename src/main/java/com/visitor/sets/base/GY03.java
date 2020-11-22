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
import com.visitor.game.Game;
import com.visitor.helpers.CounterMap;
import com.visitor.helpers.Predicates;
import com.visitor.sets.token.UnitToken;

import static com.visitor.protocol.Types.Knowledge.GREEN;
import static com.visitor.protocol.Types.Knowledge.YELLOW;

/**
 * @author pseudo
 */
public class GY03 extends Unit {

	public GY03 (Game game, String owner) {
		super(game, "GY03",
				6, new CounterMap(YELLOW, 2).add(GREEN, 2),
				"When {~} enters the battlefield, create a 5/5 green Wurm with trample.",
				5, 5,
				owner, Combat.CombatAbility.Trample);

		addEnterPlayEffect(null, "When {~} enters the battlefield, create a 5/5 green Wurm with trample.",
				() -> {
					UnitToken.Wurm_5_5(game, controller).resolve();
				});
		triggering = new Triggering(game, this).addAttackChecker(this,
				event ->
						game.addToStack(new AbilityCard(game, this, "Whenever {~} attacks, it gets +1/+1 until end of turn for each ready unit you control.",
								() ->
										game.addTurnlyAttackAndHealth(id,
												game.countInZone(controller, Game.Zone.Play, Predicates.and(Predicates::isUnit, Predicates::isReady)),
												game.countInZone(controller, Game.Zone.Play, Predicates.and(Predicates::isUnit, Predicates::isReady)))
						))
		);
	}
}
