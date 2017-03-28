export default function(rpc, notifications) {
    rpc.then(function(service) {
        var name = 'notes_token';
        var token = localStorage.getItem('notes_token');
        var username = localStorage.getItem('notes_username');
        if (token && username) {
            service.valid_token(username, token).then(function(valid) {
                if (valid) {
                    console.log('valid token');
                } else {
                    console.log('invalid token');
                }
            }).catch(function(error) {
                notifications.showError({message: error});
            });
        } else {
            service.login('kuba', 'vampire666').then(function(token) {
                if (token) {
                    localStorage.setItem('notes_token', token);
                    localStorage.setItem('notes_username', 'kuba');
                }
            }).catch(function(error) {
                notifications.showError({message: error});
            });
        }
    });
}
