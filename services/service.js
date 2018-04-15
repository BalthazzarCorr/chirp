let service = (() => {

    let appdata = 'appdata';
    let authKey = 'kinvey';
    let user = 'user';



    function getChirps() {
        let subs = sessionStorage.getItem('subscriptions');
        let endpoint = `chirps?query={"author":{"$in": ${subs}}}&sort={"_kmd.ect": 1}`;
          return  remote.get(appdata,endpoint,authKey)

    }

    function createChirp(text) {
        let endpoint = 'chirps';
        const data = {
            author:sessionStorage.getItem('username'),
            text: text
        };

        return remote.post(appdata,endpoint,authKey,data)

    }
    
    function deleteChirp(id) {
        let endpoint = 'chirps/' + id;
        return remote.remove(appdata,endpoint,authKey)
    }


    function getChirpsByUser(username) {
        let endpoint = `chirps?query={"author":"${username}"}&sort={"_kmd.ect": 1}`;
        return remote.get(appdata,endpoint,authKey)
    }
    
    async function countChirp(username) {
        return ( await getChirpsByUser(username)).length

    }

    //  function countChirp (username) {
    //     return new Promise((resolve, reject) => {
    //         remote.get('appdata', `chirps?query={"author":"${username}"}`)
    //             .then(chirps => {
    //             resolve(chirps.length);
    //         }).catch(reject);
    //     });
    // }

   async  function countFollowing(username) {
       const currentUser  =  sessionStorage.getItem('username');
      if(username  === currentUser){

          let endpoint = `?query={"username":"${username}"}`;
          let s =(await remote.get(user,endpoint))[0].subscriptions.length;
          return await Number(s) ;

      }

    }
   //  function getUsers () {
   //      return new Promise((resolve, reject) => {
   //          remote.get('user', '').then(users => {
   //              users.map(u => u.followers = users.filter(c => c.subscriptions.includes(u.username)).length);
   //              users.sort((a, b) => b.followers - a.followers);
   //              resolve(users);
   //          });
   //      });
   //  }

    //
    //  function countFollowing(username) {
    //     if (username === sessionStorage.getItem('username')) {
    //         return new Promise((resolve, reject) => {
    //             resolve(JSON.parse(sessionStorage.getItem('subscriptions')).length);
    //         });
    //     } else {
    //         return new Promise((resolve, reject) => {
    //             remote.get('user', `?query={"username":"${username}"}`).then(users => {
    //                 if (users.length !== 1) {
    //                     reject('No such user');
    //                 }
    //                 resolve(users[0].subscriptions.length);
    //             });
    //         });
    //     }
    // }
    //


    async  function countFollowers(username) {
        const currentUser  =  sessionStorage.getItem('username');

        if(currentUser === username){

            let endpoint = `?query={"subscriptions":"${username}"}`;

            return (await remote.get(user,endpoint)).length;

        }

    }
    //  function countFollowers (username) {
    //     return remote.get('user', `?query={"subscriptions":"${username}"}`);
    // }

    async function getStats(username) {
        let chirps = Number(await service.countChirp(username));
        let following = Number(await service.countFollowing(username));
        let followers = Number(await service.countFollowers(username));

        return Promise.all([chirps, following, followers]);
    }

    async  function follow(targetUser) {
        const myId = sessionStorage.getItem('userId');
        const subscriptions  = (await remote.get(user,myId)).subscriptions || [];
        subscriptions.push(targetUser);
        try {

            const response =  await  remote.update(user,myId,authKey,{subscriptions});
            sessionStorage.setItem('subscriptions',JSON.stringify(response))
        }
        catch (e) {
            alert(e.message)
        }
    }
    async  function unfollow(targetUser) {
        const myId = sessionStorage.getItem('userId');
        let subscriptions  = (await remote.get(user,myId)).subscriptions || [];
        subscriptions =  subscriptions.filter(u=> u !== targetUser);
        try {
            const response =  await  remote.update(user,myId,authKey,{subscriptions});
            sessionStorage.setItem('subscriptions',JSON.stringify(response))
        }
        catch (e) {
            alert(e.message)
        }
    }

    return{
        getChirps,
        createChirp,
        deleteChirp,
        getChirpsByUser,
        countChirp,
        countFollowing,
        countFollowers,
        follow,
        unfollow,
        getStats
    }

})();


