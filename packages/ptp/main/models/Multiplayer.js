//Extensions for multiplayer object
function fcbn(name)
{
    var players = mp.players;
    name = name.toLowerCase();
    for(var i=0;i<players.length;i++)
    {
        if(players[i].name.toLowerCase() == name)
            return players[i];
    }
    return false;
}
function MessageAll(msg)
{
    mp.players.broadcast(msg);
    Console.log(msg);
}
global.fcbn = fcbn.bind(mp);
global.MessageAll = MessageAll.bind(mp);
mp.fcbn = fcbn.bind(mp);
mp.fcbn = fcbn.bind(mp);