Parties = new Meteor.Collection("parties");

// Callbacks
Parties.deny({
	insert: function(userId, doc) {
		doc.createdAt = doc.createdAt || new Date().valueOf();
		doc.userId = doc.userId || userId;
		doc.votingOpen = doc.votingOpen || false;
		doc.users = {};
		return false;
	}
})

Meteor.methods({
	createParty: function(partyAttrs) {
		var user = Meteor.user();
		if (!Ability.canCreateParty(user, partyAttrs)) {
			throw new Meteor.Error(401,
				"You do not have permission to create a party");
		}

		// Ensure the party has a name
		if (!partyAttrs.name) {
			throw new Meteor.Error(422, "Parties need a name");
		}

		if (!partyAttrs.year) {
			throw new Meteor.Error(422, "Parties need a year");
		}

		if (!CountriesByYear[partyAttrs.year]) {
			throw new Meteor.Error(422, "Invalid year");
		}

		// Check that there are no other parties with the same name
		var partyWithSameName = Parties.findOne({name: partyAttrs.name});
		if (partyWithSameName) {
			throw new Meteor.Error(302,
				"There is alerady a party with that name",
				partyWithSameName._id);
		}

		// Pick out the whitelisted keys
		var party = _.pick(partyAttrs, 'name', 'year');
		return Parties.insert(party);
	},
	togglePartyVotingOpen: function(partyId) {
		var user = Meteor.user();
		var party = Parties.findOne(partyId);

		if (!party) {
			throw new Meteor.Error(422, "Invalid party id");
		}

		if (!Ability.canUpdateParty(user, party)) {
			throw new Meteor.Error(401, "You are not allowed to update the party");
		}

		Parties.update(partyId, {
			'$set': {
				votingOpen: !party.votingOpen
			}
		});
	}
});
