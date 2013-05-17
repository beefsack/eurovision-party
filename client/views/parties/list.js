Template.partiesList.helpers({
	parties: function() {
		return Parties.find({}, {
			sort: [['createdAt', 'desc']]
		});
	}
});
