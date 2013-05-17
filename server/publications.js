Meteor.publish('parties', function() {
	return Parties.find();
});
Meteor.publish('partyUsers', function() {
	return PartyUsers.find();
})