export default function(rpc, notifications) {
    return;
    rpc.then(function(service) {
        var name = 'notes_token';
        var token = localStorage.getItem('notes_token');
        var username = localStorage.getItem('notes_username');
        function login() {
            service.login('user', 'password').then(function(token) {
                if (token) {
                    localStorage.setItem('notes_token', token);
                    localStorage.setItem('notes_username', 'user');
                }
                notifications.showSuccess({message: 'logged ' + token});
            }).catch(function(error) {
                notifications.showError({message: error});
                service.register('user', 'jcubic@onet.pl', 'password').then(function(result) {
                    if (result === true) {
                        notifications.showSuccess({message: 'email sent'});
                    } else {
                        service.activate(result).then(function() {
                            notifications.showSuccess({
                                message: 'Email error, auto activated '
                            });
                        });
                    }
                });
            });
        }
        if (token && username) {
            service.valid_token(username, token).then(function(valid) {
                if (valid) {
                    notifications.showSuccess({message: 'valid token'});
                } else {
                    notifications.showError({message: 'invalid token'});
                    localStorage.removeItem('notes_token');
                    localStorage.removeItem('notes_username');
                    login();
                }
            });
        } else {
            login()
        }
    });
}
