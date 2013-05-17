Ability = {};

Ability.canCreateParty = function(user, party) {
	if (user && user.profile.admin) {
		return true;
	}
	return false;
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
	if (user && user.profile.admin) {
		return true;
	}
	return false;
}