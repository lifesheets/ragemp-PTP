mp.events.addCommand('veh', (player, _, vehName) => {
    if(player.admin)
    {
        var v = mp.vehicles.new(mp.joaat(vehName), player.position);
        mp.Game.gameObjects.push(v);
        player.outputChatBox(`!{#00FF00}Vehicle spawned!`);
    }
    else
        player.outputChatBox(`!{#FF0000}You must be admin to use this command.`);
});
mp.events.addCommand('pos', (player) => {
    var x = player.position.x;
    var y = player.position.y;
    var z = player.position.z;
    player.outputChatBox(`Position: ${x},${y},${z}`);
});
mp.events.addCommand('cleanup', (player) => {
    mp.players.broadcast(`There are ${mp.Game.gameObjects.length} objects spawned.`);
    mp.Game.cleanUp();
});
mp.events.addCommand('tp',(player,location) => {
    var target = mp.fcbn(location);
    if(target)
    {
        player.position = target.position;
    }
    else
    {
        switch(location.toLowerCase())
        {
            case "police":
                player.position = new mp.Vector3(0,0,0);
                break;
            case "president":
                player.position = new mp.Vector3(0,0,0);
        }
    }
});

mp.events.addCommand('kill',(player) => {
    player.health = 0;
    player.spawn();
});
mp.events.addCommand('reset',() =>
{
    mp.Game.reset();
});
mp.events.addCommand('reload',(player,config) => {
    //New game
    if(!config)
        config = "default";
    var path = `../configs/${config}.js`;
    delete require.cache[require.resolve(path)];
    var preferences = require(path);
    var game = mp.Game;
    game.end();
    mp.Game = new mp.Game.constructor(preferences);
    mp.Game.start();
});
mp.events.addCommand('move',(player,str) => {
    var args = str.split(" ");
    var team;
    var targetName = args[0];
    args.splice(0,1);
    if(args.length > 0)
        team = args.join(" ");
    if(!team)
    {
        team = targetName;
        targetName = player.name;
    }
    var target = mp.fcbn(targetName);
    if(!target)
    {
        player.outputChatBox(`Could not find player by name '${targetName}'`);
        return;
    }

    var real = undefined;
    mp.Game.teams.forEach(t => {
        if(t.name.toLowerCase() == team.toLowerCase())
            real = t;
    });
    if(!real)
    {
        player.outputChatBox(`Could not find team '${team}'`);
        return;
    }
        mp.Game.moveTeam(target,real);
    target.outputChatBox(`Moved to team ${real.name}`);
});
mp.events.addCommand('teams',(player) => {
    mp.Game.teams.forEach(t => {
        player.outputChatBox(`|| !{#${t.teamColor}}${t.name}!{#FFFFFF}: ${t.length} players`);
    });
});
mp.events.addCommand('signup',(player,password) => {
    if(!password || password.length < 4)
    {
        player.outputChatBox("!{#FF0000}Your password must be at least 4 characters.");
        return;
    }
    Database.select("accounts",{
        username: player.name,
        locked: 1
    }).then(() => {
        player.outputChatBox("Your account already exists. Please use /login or /changepassword!");
    }).catch((error) => {
        //We can make them an account!
        return Database.setPassword(player.name,password);
    }).catch(err => {
        player.outputChatBox("Unknown error occured. Could not lock user account.");
        console.log("Could not lock user account");
    });
});
mp.events.addCommand('login',(player,password) => {
    Database.login(player,password).then((data) => {
        var acc = data[0];
        player.logged = true;
        player.admin = acc.admin;
        player.outputChatBox(`${acc.admin ? "!{#00FF00}[Admin]!{#FFFFFF} ":""}Logged in successfully!`);

    }).catch((error) => {
        player.outputChatBox(`!{#FF0000}Invalid password/Username not found.`);
    });
});
mp.events.addCommand('changepassword',(player,password) => {
    if(!Database.isLogged(player))
    {
        player.outputChatBox(`!{#FF0000}You are not currently logged in. Please use !{#FFFF00}/login`);
        return;
    }
    if(!password || password.length < 4)
    {
        player.outputChatBox("!{#FF0000}Your password must be at least 4 characters.");
        return;
    }
    Database.update('accounts',{
        username: player.name,
    },{
        password: password
    }).then(() => {
        player.outputChatBox(`!{#00FF00}Password updated successfully!`);
    }).catch(() => {
        player.outputChatBox("!{#FF0000}Unknown error occured. Could not update password for account.");
        console.log("Could not update password for account.");
    });
});
mp.events.addCommand('round',(player) => {
    var game = mp.Game;
    var state = game.state;
    if(state == 0)
    {
        player.outputChatBox("Protect the president can be started at any time!");
    }
    else if(state == 1)
        player.outputChatBox("PTP is waiting for more players to join...");
    else if(state == 2)
    {
        var count = game.players.length;
        var round = game.round;
        var timems = Math.ceil((game.roundLength-(Date.now()-game.startTime))/60/1000);

        player.outputChatBox(`Round: !{#44FFFF}${round}`);
        player.outputChatBox(`Time left: !{#44FFFF}${timems} minutes`);
        player.outputChatBox(`Players: !{#44FFFF}${count}`);
    }
});
mp.events.addCommand('s',(player) => {
    var veh = player.vehicle;
    if(!veh)
    {
        player.outputChatBox("You are not in a vehicle!");
        return;
    }
    var pos = veh.position;
    var rot = veh.rotation;
    var db = veh.model;

    var position = `${pos.x} ${pos.y} ${pos.z}`;
    var rotation = `${rot.x} ${rot.y} ${rot.z}`;

    try {
        Database.insert("vehicles",{
            datablock: db,
            position: position,
            rotation: rotation
        });
        player.outputChatBox("Added vehicle to database !{#FFFF00}" + db);
    }
    catch(e) {
        player.outputChatBox("Could not add vehicle to database.");
    }
});