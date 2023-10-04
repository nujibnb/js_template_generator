function CONNECTION_NAME_enrich_token(user, context, callback) {
    // Exit if the connection name is not "TEST"
    if (context.connection !== 'CONNECTION_NAME') {
      return callback(null, user, context);
    }
  
    // Check if user metadata contains required fields
    if (user.user_metadata && user.user_metadata.ROLE_FIELD) {
      // Add 'Roles' claim to the token with the value of user.user_metadata.groups
      context.idToken['https://yournamespace.com/roles'] = user.user_metadata.ROLE_FIELD;
    }
  
    if (user.user_metadata && user.user_metadata.SITEID_FIELD) {
      // Add 'Info' claim to the token with the value of user.user_metadata.info
      context.idToken['https://yournamespace.com/sites'] = user.user_metadata.SITEID_FIELD;
    }
  
    callback(null, user, context);
  }