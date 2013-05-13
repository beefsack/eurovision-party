Parties = new Meteor.Collection("parties");

Meteor.methods({
	createParty: function(partyAttrs) {
		var user = Meteor.user();

		// Ensure the user is logged in
		if (!user) {
			throw new Meteor.Error(401, "You need to login to create a party");
		}

		// Ensure the party has a name
		if (!partyAttrs.name) {
			throw new Meteor.Error(422, "Parties need a name");
		}

		// Check that there are no other parties with the same name
		var partyWithSameName = Parties.findOne({name: partyAttrs.name});
		if (partyWithSameName) {
			throw new Meteor.Error(302,
				"There is alerady a party with that name",
				partyWithSameName._id);
		}

		// Pick out the whitelisted keys
		var party = _.extend(_.pick(partyAttrs, 'name'), {
			userId: user._id,
			createdAt: new Date().getTime()
		});

		var partyId = Parties.insert(party);
		return partyId;
	}
});
