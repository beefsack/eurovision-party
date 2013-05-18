Template.partiesShow.helpers({
	party: function() {
		return Parties.findOne(Session.get('partyId'));
	},
	partyUsers: function() {
		return PartuUsers.find();
	},
	showToggleVotingOpenButton: function() {
		return Ability.canUpdateParty(Meteor.user(),
			Parties.findOne(Session.get('partyId')));
	},
	showAddUserButton: function() {
		return Ability.canCreatePartyUser(Meteor.user(), Parties.findOne(
			Session.get('partyId')));
	},
	showYourVotes: function() {
		return Meteor.userId() && PartyUsers.findOne({
			userId: Meteor.userId()
		});
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
	voteScore: function() {
		return this.score && this.score !== 0 ? this.score : '';
	},
	partyUsersScores: function() {
		var users = [];
	},
	isFocusing: function() {
		return Session.get('focusCountry') == this.id;
	},
	isEditing: function() {
		var party = Parties.findOne(Session.get('partyId'));
		return party && party.votingOpen && Session.get('focusCountry') ==
			this.id;
	},
	yourCountryRank: function() {
		return Template.partiesShow.rankedCountriesForUser(Meteor.userId());
	}
});

Template.partiesShow.partiesShowFocusOn = function(countryId) {
	Session.set('focusCountry', countryId);
	setTimeout(function() {
		$('html, body').animate({
			scrollTop: ($('#country' + countryId).offset().top - 50) + 'px'
		}, 'fast');
	}, 0);
};

Template.partiesShow.rankedCountriesForUser = function(userId) {
	if (!userId) {
		return;
	}
	var pu = PartyUsers.findOne({
		partyId: Session.get('partyId'),
		userId: userId
	});
	if (!pu) {
		return;
	}
	var p = Parties.findOne(Session.get('partyId'));
	if (!p) {
		return;
	}
	var rank = 0;
	return _.map(_.sortBy(_.map(CountriesByYear[p.year], function(c) {
		return _.extend(c, {
			score: pu.countryScores && pu.countryScores[c.id] &&
				pu.countryScores[c.id] !== 0 ? pu.countryScores[c.id] : null
		});
	}), function(c) {
		return -c.score;
	}), function(c) {
		c.rank = c.score && rank < 10 && ++rank;
		return c;
	});
};

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
	'click .close-country-button': function(event) {
		Session.set('focusCountry', null);
		return false;
	},
	'click .countries-list .country': function(event) {
		if (this.id !== Session.get('focusCountry')) {
			Template.partiesShow.partiesShowFocusOn(this.id);
		}
	},
	'change #country-quick-select': function(event) {
		Template.partiesShow.partiesShowFocusOn(event.target.value);
	},
	'click input.edit-score': function(event) {
		event.target.select();
	},
	'submit .edit-score': function(event) {
		event.preventDefault();
		var score = parseFloat($(event.target).find('input.edit-score').val());
		if (_.isNaN(score)) {
			return alert("Score must be a number, eg. 0, 5 or 90.2");
		}
		var pu = PartyUsers.findOne({
			userId: Meteor.userId(),
			partyId: Session.get('partyId')
		});
		if (!pu) {
			return;
		}
		var countryId = this.id;
		Meteor.call('setPartyUserCountryScore', pu._id, this.id, score,
			function(error) {
				if (error) {
					return alert(error.reason);
				}
				Template.partiesShow.partiesShowFocusOn(countryId);
			});
	}
});
