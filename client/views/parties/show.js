Template.partiesShow.helpers({
	party: function() {
		return Parties.findOne(Session.get('partyId'));
	},
	partyUsers: function() {
		return PartyUsers.find();
	},
	partyUsersByScore: function() {
		return Template.partiesShow.usersByScore();
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
	showCountryScoreInputs: function() {
		var party = Parties.findOne(Session.get('partyId'));
		return Ability.canUpdateParty(Meteor.user(), party);
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
	isFocusing: function() {
		return Session.get('focusCountry') == this.id;
	},
	isVotingOpen: function() {
		var party = Parties.findOne(Session.get('partyId'));
		return party && party.votingOpen;
	},
	isEditing: function() {
		var party = Parties.findOne(Session.get('partyId'));
		return party && party.votingOpen && Session.get('focusCountry') ==
			this.id;
	},
	yourCountryRank: function() {
		return Template.partiesShow.rankedCountriesForUser(Meteor.userId());
	},
	countriesByScore: function() {
		var countries = Template.partiesShow.countriesByScore();
		var filter = Session.get('countryLadderSearch');
		if (filter && !filter.match(/^\s+$/)) {
			filter = filter.toLowerCase();
			countries = _.filter(countries, function(c) {
				return c.name.toLowerCase().indexOf(filter) !== -1;
			});
		}
		return countries;
	},
	colWidth: function() {
		return Meteor.userId() && PartyUsers.findOne({
			userId: Meteor.userId()
		}) ? 4 : 6;
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

Template.partiesShow.countriesByScore = function() {
	var p = Parties.findOne(Session.get('partyId'));
	if (!p) {
		return;
	}
	var rank = 0;
	return _.map(_.sortBy(_.map(CountriesByYear[p.year], function(c) {
		return _.extend(c, {
			score: p.countryScores && p.countryScores[c.id] || 0
		});
	}), function(c) {
		return -c.score;
	}), function(c) {
		c.rank = ++rank;
		return c;
	});
};

Template.partiesShow.usersByScore = function() {
	var countries = _.map(_.filter(_.first(
		Template.partiesShow.countriesByScore() || [], 10), function(c) {
		return c.score > 0;
	}), function(c) {
		return {
			id: c.id,
			rank: c.rank
		};
	});
	var pu = PartyUsers.find({
		partyId: Session.get('partyId')
	});
	if (!pu) {
		return;
	}
	var rank = 0;
	return _.map(_.sortBy(pu.map(function(u) {
		var score = 0;
		var userCountries = _.filter(_.first(Template.partiesShow.
			rankedCountriesForUser(u.userId) || [], 10), function(c) {
			return c.rank;
		});
		_.each(userCountries, function(c) {
			var actualC = _.find(countries, function(ac) {
				return ac.id === c.id;
			});
			if (actualC) {
				// One point if the country is in the top 10
				score++;
				if (actualC.rank === c.rank) {
					// Another point if the country is in the right spot
					score++;
				}
			}
		});
		return _.extend(u, {
			score: score,
			userCountries: userCountries
		});
	}), function(u) {
		return -u.score;
	}), function(u) {
		u.rank = ++rank;
		return u;
	});
}

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
			return alert("Score must be a number between 0 and 100");
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
					Template.partiesShow.partiesShowFocusOn(countryId);
					return alert(error.reason);
				}
			});
		Template.partiesShow.partiesShowFocusOn(countryId);
	},
	'submit .country-score': function(event) {
		event.preventDefault();
		var score = parseFloat($(event.target).find('input.country-score').val());
		if (_.isNaN(score)) {
			return alert("Score must be a number, eg. 0, 5 or 90.2");
		}
		var party = Parties.findOne(Session.get('partyId'));
		if (!party) {
			return;
		}
		var countryId = this.id;
		Meteor.call('setPartyCountryScore', party._id, this.id, score,
			function(error) {
				if (error) {
					return alert(error.reason);
				}
			});
	},
	'keyup #country-ladder-search': function(event) {
		Session.set('countryLadderSearch', event.target.value);
	}
});
