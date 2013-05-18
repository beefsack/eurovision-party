Ability = {};

Ability.canCreateParty = function(user, party) {
	return user && user.profile.admin;
};

Ability.canReadParty = function(user, party) {
	return true;
};

Ability.canUpdateParty = function(user, party) {
	return Ability.canCreateParty(user, party);
};

Ability.canDeleteParty = function(user, party) {
	return Ability.canCreateParty(user, party);
}

Ability.canCreateVote = function(user, party) {
	return false;
}

Ability.canCreatePartyUser = function(user, party, userToAdd) {
	return user && user.profile.admin;
}

Ability.canUpdatePartyUserScore = function(user, partyUser) {
	return user && user._id === partyUser.userId;
}