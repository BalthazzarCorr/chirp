$(()=>{

    const app = Sammy('#main',function () {
            this.use('Handlebars','hbs');
            this.get('index.html',function () {
              this.redirect('#/home');
              return;
            });
            this.get('#/home', getWelcomePage);
            this.get('#/login',getWelcomePage);
            this.get('#/register', (ctx) => {
                if (!auth.isAuth()) {
                    ctx.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs'
                    }).then(function () {
                        this.partial('./templates/register.hbs')
                    })
                } else {
                    ctx.redirect('#/feed')
                }
            });
            this.post('#/register',(ctx)=>{
                let username = ctx.params.username;
                let password = ctx.params.password;
                let repeatPass = ctx.params.repeatPass;

                let usernameMatch = /^[A-za-z]{5,}$/.test(username);
                let passMatch = /^[A-za-z\d]{6,}$/.test(password);

                if (!usernameMatch) {
                    displayNotification.showError('Username should be at least 5 characters long');

                } else if (!passMatch) {
                    displayNotification.showError('Password should be at least 6 characters long')

                } else if (password !== repeatPass) {
                    displayNotification.showError('Passwords must match')
                } else {
                    auth.register(username, password)
                        .then((userData) => {
                            auth.saveSession(userData);
                            displayNotification.showInfo('User registration successful!');
                            ctx.redirect('#/feed');
                        })
                        .catch(displayNotification.handleError);
                }
            });
            this.post('#/login',(ctx)=>{
                let username = ctx.params.username;
                let password = ctx.params.password;

                if(username === '' || password === ''){
                displayNotification.showError('username and password can`t be empty ')
                }else{
                auth.login(username,password)
                    .then((userData)=>{
                    auth.saveSession(userData);
                    displayNotification.showInfo('Login Successful.');
                    ctx.redirect('#/feed');
                }).catch(displayNotification.handleError)
                }

            });
            this.get('#/logout',(ctx) =>{
               auth.logout().then(()=> {
                   sessionStorage.clear();
                   ctx.redirect('#/home')
               }).catch(displayNotification.handleError)
            });
            this.get('#/feed',(ctx)=>{
                if (auth.isAuth()) {
                    ctx.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        menu: './templates/common/menu.hbs'
                    }).then(function () {

                        service.getChirps().then(data =>{
                            ctx.username = sessionStorage.getItem('username');
                             ctx.chirps = data;
                             data.forEach(p => {
                              p.date = calcTime(p._kmd.ect);
                             });
                             service.getStats(sessionStorage.getItem('username')).then(stats =>{
                                 stats =
                                     {
                                     chirpsCount: stats[0],
                                     following: stats[1],
                                     followers: stats[2]
                                 };
                                 ctx.render('./templates/common/stats.hbs', {stats})
                                     .then(function () {
                                     this.replace('#userStats');
                                 });
                             }).catch(displayNotification.handleError);

                            this.partial('./templates/feed.hbs')
                        })

                    })
                }
            });




        function getWelcomePage(ctx) {

            if (!auth.isAuth()) {
                ctx.loadPartials({
                    header: './templates/common/header.hbs',
                    footer: './templates/common/footer.hbs'
                }).then(function () {
                    this.partial('./templates/login.hbs')
                })
            } else {
                ctx.redirect('#/feed')
            }
        }
        function calcTime(dateIsoFormat) {
            let diff = new Date - (new Date(dateIsoFormat));
            diff = Math.floor(diff / 60000);
            if (diff < 1) return 'less than a minute';
            if (diff < 60) return diff + ' minute' + pluralize(diff);
            diff = Math.floor(diff / 60);
            if (diff < 24) return diff + ' hour' + pluralize(diff);
            diff = Math.floor(diff / 24);
            if (diff < 30) return diff + ' day' + pluralize(diff);
            diff = Math.floor(diff / 30);
            if (diff < 12) return diff + ' month' + pluralize(diff);
            diff = Math.floor(diff / 12);
            return diff + ' year' + pluralize(diff);

            function pluralize(value) {
                if (value !== 1) return 's';
                else return '';
            }
        }
    });


    app.run();
});