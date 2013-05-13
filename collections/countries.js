Countries = new Meteor.Collection("countries");

Meteor.methods({
	initialiseCountries: function() {
		var user = Meteor.user();

		if (!user) {
			throw new Meteor.Error(401,
				"Must be logged in to initialise countries");
		}

		if (!user.profile.admin) {
			throw new Meteor.Error(401, "Only admins can initialise countires");
		}

		var countries = [
			{name: 'Albania', alpha2Code: 'AL'},
			{name: 'Andorra', alpha2Code: 'AD'},
			{name: 'Armenia', alpha2Code: 'AM'},
			{name: 'Austria', alpha2Code: 'AT'},
			{name: 'Azerbaijan', alpha2Code: 'AZ'},
			{name: 'Belarus', alpha2Code: 'BY'},
			{name: 'Belgium', alpha2Code: 'BE'},
			{name: 'Bosnia and Herzegovina', alpha2Code: 'BA'},
			{name: 'Bulgaria', alpha2Code: 'BG'},
			{name: 'Croatia', alpha2Code: 'HR'},
			{name: 'Cyprus', alpha2Code: 'CY'},
			{name: 'Czech Republic', alpha2Code: 'CZ'},
			{name: 'Denmark', alpha2Code: 'DK'},
			{name: 'Estonia', alpha2Code: 'EE'},
			{name: 'Finland', alpha2Code: 'FI'},
			{name: 'France', alpha2Code: 'FR'},
			{name: 'Georgia', alpha2Code: 'GE'},
			{name: 'Germany', alpha2Code: 'DE'},
			{name: 'Greece', alpha2Code: 'GR'},
			{name: 'Hungary', alpha2Code: 'HU'},
			{name: 'Iceland', alpha2Code: 'IS'},
			{name: 'Ireland', alpha2Code: 'IE'},
			{name: 'Israel', alpha2Code: 'IL'},
			{name: 'Italy', alpha2Code: 'IT'},
			{name: 'Latvia', alpha2Code: 'LV'},
			{name: 'Lithuania', alpha2Code: 'LT'},
			{name: 'Luxembourg', alpha2Code: 'LU'},
			{name: 'Macedonia', alpha2Code: 'MK'},
			{name: 'Malta', alpha2Code: 'MT'},
			{name: 'Moldova', alpha2Code: 'MD'},
			{name: 'Monaco', alpha2Code: 'MC'},
			{name: 'Montenegro', alpha2Code: 'ME'},
			{name: 'Morocco', alpha2Code: 'MA'},
			{name: 'Netherlands', alpha2Code: 'NL'},
			{name: 'Norway', alpha2Code: 'NO'},
			{name: 'Poland', alpha2Code: 'PL'},
			{name: 'Portugal', alpha2Code: 'PT'},
			{name: 'Romania', alpha2Code: 'RO'},
			{name: 'Russia', alpha2Code: 'RU'},
			{name: 'San Marino', alpha2Code: 'SM'},
			{name: 'Serbia', alpha2Code: 'RS'},
			{name: 'Slovakia', alpha2Code: 'SK'},
			{name: 'Slovenia', alpha2Code: 'SI'},
			{name: 'Spain', alpha2Code: 'ES'},
			{name: 'Sweden', alpha2Code: 'SE'},
			{name: 'Switzerland', alpha2Code: 'CH'},
			{name: 'Turkey', alpha2Code: 'TR'},
			{name: 'Ukraine', alpha2Code: 'UA'},
			{name: 'United Kingdom', alpha2Code: 'GB'}
		];

		// Make sure we have all of the countries of the set
		_.each(countries, function(c) {
			var existingCountry = Countries.findOne({alpha2Code: c.alpha2Code});
			if (existingCountry) {
				// We have a pre-existing non-active country
				Countries.update(existingCountry._id, {
					'$set': {
						name: c.name,
						active: true
					}
				});
			} else if (!existingCountry) {
				// We need to create a new country
				Countries.insert(_.extend(c, {
					active: true
				}));
			}
		});

		// Remove any extras which are no longer active
		Countries.update({
			active: true,
			alpha2Code: {
				'$nin': _.pluck(countries, 'alpha2Code')
			}
		}, {
			'$set': {
				active: false
			}
		});
	}
});
