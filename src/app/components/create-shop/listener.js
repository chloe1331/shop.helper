export default () => {
    window.ipcRenderer.on('listen', (event, userInfo = {}) => {
        const onChange = (data) => {
            window.ipcRenderer.sendToHost(data);
        };
        const usernameInput = document.getElementById('TPL_username_1');
        const passwordInput = document.getElementById('TPL_password_1');
        let username = usernameInput && usernameInput.value || null;
        let password = passwordInput && passwordInput.value || null;
        let hasSetUsername = false;
        let hasSetPassword = false;

        if (usernameInput) {
            usernameInput.addEventListener('input', (e) => {
                username = e.target.value;

                onChange && onChange({
                    username
                });
            });

            if (userInfo.username) {
                usernameInput.value = userInfo.username;
                hasSetUsername = true;
            } else {
                usernameInput.value = '';
            }
        }

        if (passwordInput) {
            passwordInput.addEventListener('input', (e) => {
                password = e.target.value;

                onChange && onChange({
                    password
                });
            });

            if (userInfo.password) {
                passwordInput.value = userInfo.password;
                hasSetPassword = true;
            } else {
                usernameInput.value = '';
            }
        }

        if (username && !userInfo.username) {
            onChange && onChange({
                username
            });
        }

        if (password && !userInfo.password) {
            onChange && onChange({
                password
            });
        }

        if (hasSetUsername && hasSetPassword) {
            // document.getElementById('J_SubmitStatic').click();
        }
    });
};