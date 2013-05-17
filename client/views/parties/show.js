Template.partiesShow.helpers({
	party: function() {
		return Parties.findOne(Session.get('partyId'));
	},
	showToggleVotingOpenButton: function() {
		return Ability.canUpdateParty(Meteor.user(),
			Parties.findOne(Session.get('partyId')));
	},
	showAddUserButton: function() {
		return Ability.canCreatePartyUser(Meteor.user(), Parties.findOne(
			Session.get('partyId')));
	},
	countries: function() {
		var party = Parties.findOne(Session.get('partyId'));
		return party ? _.sortBy(_.values(CountriesByYear[party.year]), 'name')
			: [];
	},
	flagPath: function() {
		return '/images/flags/' + this.id.toLowerCase() + '.png';
	},
	imagePath: function() {
		var party = Parties.findOne(Session.get('partyId'));
		if (!party) {
			return null;
		}
		return '/images/participants/' + party.year + '/' +
			this.id.toLowerCase() + '.jpg';
	},
	score: function() {
		return 0;
	},
	isFocusing: function() {
		return Session.get('focusCountry') == this.id;
	},
	isEditing: function() {
		var party = Parties.findOne(Session.get('partyId'));
		return party && party.votingOpen && Session.get('focusCountry') ==
			this.id;
	}
});

Template.partiesShow.events({
	'click #toggle-party-voting-open' : function (event) {
		event.preventDefault();
		Meteor.call('togglePartyVotingOpen', Session.get('partyId'),
			function(error) {
				if (error) {
					return alert(error.reason);
				}
			});
	},
	'click .countries-list .country': function(event) {
		Session.set('focusCountry', this.id);
	},
	'change #country-quick-select': function(event) {
		var countryId = event.target.value;
		Session.set('focusCountry', countryId);
		setTimeout(function() {
			$('html, body').animate({
				scrollTop: ($('#country' + countryId).offset().top - 30) + 'px'
			}, 'fast');
		}, 0);
	},
	'click .save-country-button': function(event) {

	},
	'click .close-country-button': function(event) {
		Session.set('focusCountry', null);
	}
});
