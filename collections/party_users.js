PartyUsers = new Meteor.Collection("partyUsers");

// Callbacks
PartyUsers.deny({
	insert: function(userId, doc) {
		doc.createdAt = doc.createdAt || new Date().valueOf();
		doc.addedBy = doc.addedBy || userId;
		doc.countryScores = {};
		return false;
	}
});

Meteor.methods({
	addUserToParty: function(userId, partyId) {
		var userToAdd = Meteor.users.findOne(userId);
		if (!userToAdd) {
			throw new Meteor.Error(422, "Could not find user");
		}

		var party = Parties.findOne(partyId);
		if (!party) {
			throw new Meteor.Error(422, "Could not find party");
		}

		var user = Meteor.user();
		if (!Ability.canCreatePartyUser(user, party, userToAdd)) {
			throw new Meteor.Error(401, "Not allowed to add user to party");
		}

		var partyUser = {
			userId: userId,
			partyId: partyId
		};
		return PartyUsers.insert(partyUser);
	}	
});
