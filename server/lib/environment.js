Accounts.onCreateUser(function(options, user) {
	// Make sure profile is an object
	user.profile = options.profile || {};

	// First user is automatically an admin
	user.profile.admin = !Meteor.users.findOne({profile: {admin: true}});
	
	return user;
});
