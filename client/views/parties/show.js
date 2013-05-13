Template.partiesShow.helpers({
	party: function() {
		return Parties.findOne(Session.get('partyId'));
	}
});