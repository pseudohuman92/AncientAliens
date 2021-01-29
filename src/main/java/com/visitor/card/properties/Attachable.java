/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.visitor.card.properties;

import com.visitor.card.types.helpers.AbilityCard;
import com.visitor.game.Card;
import com.visitor.game.Game;
import com.visitor.helpers.Arraylist;
import com.visitor.helpers.Predicates;
import com.visitor.helpers.containers.ActivatedAbility;

import java.util.Arrays;
import java.util.UUID;
import java.util.function.Consumer;
import java.util.function.Predicate;

/**
 * Interface for cards that has an activating ability.
 *
 * @author pseudo
 */
public class Attachable {

	private final Card card;
	private final Game game;

	private Predicate<Card> validTarget;
	private UUID attachedTo;
	private Consumer<UUID> afterAttached;
	private Consumer<UUID> afterRemoved;

	// Constructors
	public Attachable (Game game, Card card, Predicate<Card> validTarget,
	                   Consumer<UUID> afterAttached, Consumer<UUID> afterRemoved) {
		this.game = game;
		this.card = card;
		this.validTarget = validTarget;
		this.afterAttached = afterAttached;
		this.afterRemoved = afterRemoved;
	}

	public final void setAttachTo (UUID attachedId){
		attachedTo = attachedId;
	}

	public final void attach (){
		game.addAttachmentTo(attachedTo, card.id);
		afterAttached.accept(attachedTo);
	}

	public final void removeFromAttached (){
		game.removeAttachmentFrom(attachedTo, card.id);
		afterRemoved.accept(attachedTo);
		attachedTo = null;
	}

	public void clear () {
		attachedTo = null;
	}
}
