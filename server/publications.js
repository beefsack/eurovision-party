Meteor.publish('parties', function() {
	return Parties.find();
});
Meteor.publish('partyUsers', function() {
	return PartyUsers.find();
});
Meteor.publish("users", function () {
	return Meteor.users.find({
		fields: {
			'other': 1,
			'things': 1
		}
	});
});