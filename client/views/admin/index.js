Template.adminIndex.events({
	"click #initialise-countries": function() {
		Meteor.call('initialiseCountries', function(error) {
			if (error) {
				return alert(error.reason);
			}
			alert('Initialised countries');
		});
	}
});
