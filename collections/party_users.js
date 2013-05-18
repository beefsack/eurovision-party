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

		var existing = PartyUsers.findOne({
			userId: userId,
			partyId: partyId
		});
		if (existing) {
			throw new Meteor.Error(422, "User is already in party");
		}

		var partyUser = {
			userId: userId,
			partyId: partyId,
			username: userToAdd.username,
			partyName: party.name,
			partyYear: party.year
		};
		return PartyUsers.insert(partyUser);
	},
	setPartyUserCountryScore: function(partyUserId, country, score) {
		var user = Meteor.user();
		var partyUser = PartyUsers.findOne(partyUserId);
		if (!partyUser) {
			throw new Meteor.Error(422, "Could not find party user");
		}

		if (!Ability.canUpdatePartyUserScore(user, partyUser)) {
			throw new Meteor.Error(401,
				"Not allowed to set score for party user");
		}

		if (!_.isNumber(score)) {
			throw new Meteor.Error(422, "Score must be a number, eg. 5 or 90.2");
		}

		partyUser.countryScores = partyUser.countryScores || {};
		var update = {
			'$set': {}
		};
		update['$set']['countryScores.' + country] = score;
		PartyUsers.update(partyUserId, update);
	}
});
