package com.visitor.sets.base;

import com.visitor.card.types.Ritual;
import com.visitor.game.Game;
import com.visitor.helpers.CounterMap;

import static com.visitor.protocol.Types.Knowledge.BLUE;

public class UR01 extends Ritual {
	public UR01 (Game game, String owner) {
		super(game, "UR01", 6,
				new CounterMap<>(BLUE, 2),
				"Return up to 3 target units to their controller's hands.",
				owner);

		playable
				.setTargetMultipleUnits(3, true, cardId -> game.getCard(cardId).returnToHand());
	}
}