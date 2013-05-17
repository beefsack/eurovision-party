Template.partiesNew.helpers({
	years: _.keys(CountriesByYear)
});

Template.partiesNew.events({
	'submit form' : function (event) {
		event.preventDefault();
		var party = {
			name: $(event.target).find('[name=name]').val(),
			year: $(event.target).find('[name=year]').val()
		};
		Meteor.call('createParty', party, function(error, id) {
			if (error) {
				return alert(error.reason);
			}
			Meteor.Router.to('partiesShow', id);
		});
	}
});
