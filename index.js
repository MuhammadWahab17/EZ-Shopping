const { match } = require('assert');
const e = require('express');
var express = require('express');
var http = require('http');
const { machine } = require('os');
var path = require('path');
const { unescape } = require('querystring');
const request = require('request');
var app = express();
app.set('views',path.join(__dirname,'view'));
app.set('view engine','pug');


function homepage(req,res){
    const url = "https://api.cricapi.com/v1/currentMatches?apikey=248ff166-ec4a-43da-801c-6faf87a2194f&offset=0";
    request(url, { json: true }, (err, response, body) => {
        if (err) { return console.log(err); }
        if(body.data == undefined || body.data.length == 0){
            res.render('homePage',{
                array:[],
                total:"Api limit reached",
                live:"",
                finished:"",
                livetoday:""
            });
        }else{
            let matches = []
            let live = 0;
            let rows = body.info.totalRows;
            for(let data of body.data){
                if(!data.matchEnded){
                    live++;
                }
                let s1 = "Yet to play", s2 = "Yet to play", inn1 = "", inn2 = "";
                if(data.score.length > 0){
                    s1 = data.score[0].r+" for "+data.score[0].w+" in "+data.score[0].o+" overs";
                    inn1 = data.score[0].inning;
                }if(data.score.length > 1){
                    s2 = data.score[1].r+" for "+data.score[1].w+" in "+data.score[1].o+" overs"
                    inn2 = data.score[1].inning;
                }
                matches.push({
                    name : data.name,
                    matchtype : data.matchType,
                    venue: data.venue,
                    date: data.dateTimeGMT,
                    status:data.status,
                    t1:inn1,
                    t2:inn2,
                    score1:s1,
                    score2:s2
                });
            }
            res.render('homePage',{
                array:matches,
                total:rows,
                live:live,
                finished:rows - live,
                livetoday:live
            });
        
        }
    })
}

app.get("/",(req,res)=>{
    homepage(req,res);
})

app.get("/home",(req,res)=>{
    homepage(req,res);
})

app.get('/Scoreboard',(req,res)=>{
    const url = "https://api.cricapi.com/v1/cricScore?apikey=248ff166-ec4a-43da-801c-6faf87a2194f";
    request(url, { json: true }, (err, response, body) => {
        if (err) { return console.log(err); }
        let matches = []
        let live = 0;
        let rows = 0;
        if(body.data == undefined || body.data.length == 0){
            res.render('homePage',{
                array:[],
                total:"Api limit reached",
                live:"",
            });
            return;
        }
        for(let data of body.data){
            if(data.ms == "live"){
                matches.push({
                    status : data.status,
                    t1:data.t1,
                    t2:data.t2,
                    score1:data.t1s,
                    score2:data.t2s
                });
                live++;
                
            }
            rows++;
        }
        res.render('ScoreBoad',{
            array:matches,
            total:rows,
            live:live,
        });
    });
    
})

//Series info
app.get('/SeriesInfo',(req,res)=>{
    const url = "https://api.cricapi.com/v1/series?apikey=2e5d64de-24e8-425c-8f20-37bb77c165da&offset=0"
    request(url, { json: true }, (err, response, body) => {
        if (err) { return console.log(err); }
        let matches = [];
        let i = 0;
        if(body.data == undefined || body.data.length == 0){
            res.render('homePage',{
                array:[],
                total:"Api limit reached",
            });
            return;
        }
        for (let data of body.data){
            matches.push({
                series:data.name,
                schedule:"from "+data.startDate+" to "+data.endDate,
                totalmatches:data.matches+" (ODI: "+data.odi+", T20: "+data.t20+", Tests: "+data.test+")"
            })
            i++;
        }
        res.render('series', {
            array:matches,
            total:i
        });
    });
})
// Teams
app.get('/Teams',(req,res)=>{
    let players = [
        [
            {link:"playerInfo?player=Babar+Azam",name:"Babar Azam (C)",img:"https://www.cricket.com.au/-/media/14665188D3BA4C09B7DA742DED1E6F04.ashx"},
            {link:"playerInfo?player=Mohammad+Rizwan",name:" Mohammad Rizwan (wk)",img:"https://www.cricket.com.au/-/media/8203DFF06DF74593B0E4EC87488F1CA4.ashx"},
            {link:"playerInfo?player=Mohammad+Haris",name:"Mohammad Haris",img:"https://resources.pulse.icc-cricket.com/players/33992/284/19205.png"},
            {link:"playerInfo?player=Shan+Masood",name:"Shan Masood",img:"https://www.bigbash.com.au/-/media/Players/Men/International/Pakistan/2021-22%20Tests/Shan-Masood.ashx"},
            {link:"playerInfo?player=Iftikhar+Ahmed",name:"Iftikhar Ahmed",img:"https://resources.pulse.icc-cricket.com/players/33992/284/2888.png"},
            {link:"playerInfo?player=Shadab+Khan",name:"Shadab Khan",img:"https://resources.pulse.icc-cricket.com/players/33992/284/3046.png"},
            {link:"playerInfo?player=Mohammad+Nawaz",name:"Mohammad Nawaz",img:"https://thedailyguardian.com/wp-content/uploads/2022/10/Mohammad-Nawaz.png"},
            {link:"playerInfo?player=>Mohammad+Wasim+Jr",name:"Mohammad Wasim Jr",img:"https://www.bigbash.com.au/-/media/Players/Men/International/Pakistan/2022%20T20WC/mohammad-wasim-t20wc22.ashx"},
            {link:"playerInfo?player=Naseem+Shah",name:"Naseem Shah",img:"https://resources.pulse.icc-cricket.com/players/33992/284/18832.png"},
            {link:"playerInfo?player=Haris+Rauf",name:"Haris Rauf",img:"https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/322200/322202.png"},
            {link:"playerInfo?player=Shaheen+Afridi",name:"Shaheen Afridi",img:"https://resources.pulse.icc-cricket.com/players/33992/284/4530.png"}
        ],
        [
            {link:"playerInfo?player=Jos+Buttler",name:"Jos Buttler (c & wk)",img:"https://www.pngkey.com/png/full/360-3609023_view-jos-buttler-age-jos-buttler-wife-jos.png"},
            {link:"playerInfo?player=Alex+Hales",name:"Alex Hales",img:"https://www.aboutpakistan.com/sports/wp-content/uploads/2021/02/Alex-Hales.jpg"},
            {link:"playerInfo?player=Philip+Salt",name:"Philip Salt",img:"https://www.islamabadunited.com/wp-content/uploads/2019/02/IU_Salt.png"},
            {link:"playerInfo?player=Ben+Stokes",name:"Ben Stokes",img:"https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/319700/319748.png"},
            {link:"playerInfo?player=Harry+Brook",name:"Harry Brook",img:"https://resources.pulse.icc-cricket.com/players/33992/284/100476.png"},
            {link:"playerInfo?player=Liam+Livingstone",name:"Liam Livingstone",img:"https://resources.ecb.co.uk/player-photos/t20i/480x480/3644.png"},
            {link:"playerInfo?player=Moeen+Ali",name:"Moeen Ali",img:"https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/316500/316557.png"},
            {link:"playerInfo?player=Sam+Curran",name:"Sam Curran",img:"https://starsunfolded.com/wp-content/uploads/2018/08/Sam-Curran.jpg"},
            {link:"playerInfo?player=Chris+Woakes",name:"Chris Woakes",img:"https://bsmedia.business-standard.com/_media/bs/img/topic-profile/profile-images/thumb/400_400/1559158235.jpg"},
            {link:"playerInfo?player=Chris+Jordan",name:"Chris Jordan",img:"https://i.guim.co.uk/img/media/4f3a7df61d012d47dd7553006e58f68c05868d8b/0_228_2474_1484/master/2474.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=5d38b994878e1e94a7e51fc759fa36fc"},
            {link:"playerInfo?player=Adil+Rashid",name:"Adil Rashid",img:"https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/319700/319741.png"}
        ]
    ]
    res.render('teams',
    {teams:players})
})

app.get('/playerInfo',(req,res)=>{
    request('https://api.cricapi.com/v1/players?apikey=b69af594-e8b3-45e4-8c54-53cf8bd412f4&offset=0&search='+req.query.player, { json: true }, (err, response, body) => {
        if (err) { return console.log(err); }
        if(body.data == undefined){
            res.render('playerInfo',{
                playername:"Data Not found (Server error)",
                role:"",
                country:"",
                img:"",
                battingStyle:"",
                bowlingStyle:"",
                placeOfBirth:"",
                battingStat:[],
                bowlingStats:[]
            });
            return;
        }
        if(body.data[0] == undefined){
            res.render('playerInfo',{
                playername:"Player not found (Incorrect name)",
                role:"",
                country:"",
                img:"",
                battingStyle:"",
                bowlingStyle:"",
                placeOfBirth:"",
                battingStat:[],
                bowlingStats:[]
            });
            return;
        }else{
            const url = 'https://api.cricapi.com/v1/players_info?apikey=b69af594-e8b3-45e4-8c54-53cf8bd412f4&id='+body.data[0].id
            request(url, { json: true }, (err, response, body) => {
                if (err) { return console.log(err); }
                let batting = []
                let battingindexes = []
                let bowlingindexes = []
                console.log(body.data.stats);
                let array = ['Test','ODI','T20']
                if(body.data.stats != undefined){
                    if(body.data.stats[0].matchtype == 'test'){
                        battingindexes = [0,13,26]
                        bowlingindexes = [39,51,63]
                        array = ['Test','ODI','T20']
                    }
                    if(body.data.stats[0].matchtype == 'odi'){
                        battingindexes = [0,13]
                        bowlingindexes = [26,38]
                        array = ['ODI','T20']
                    }
                    if(body.data.stats[0].matchtype == 't20'){
                        battingindexes = [0]
                        bowlingindexes = [12]
                        array = ['T20']
                    }
                }
                
                console.log(battingindexes)
                console.log(bowlingindexes)
                let k =0;
                for(let i of battingindexes){
                    
                    let object = {
                        type:array[k++],
                        m:body.data.stats[parseInt(i)].value, 
                        inn:body.data.stats[parseInt(i)+1].value,
                        runs:body.data.stats[parseInt(i)+3].value,
                        hs:body.data.stats[parseInt(i)+4].value,
                        avg:body.data.stats[parseInt(i)+5].value,
                        sr:body.data.stats[parseInt(i)+7].value,
                        h:body.data.stats[parseInt(i)+8].value,
                        th:body.data.stats[parseInt(i)+9].value,
                        f:body.data.stats[parseInt(i)+10].value,
                        four:body.data.stats[parseInt(i)+11].value,
                        six:body.data.stats[parseInt(i)+12].value,
                    }
                    batting.push(object);
                }
                let bowlingStat = []
                k=0;
                for(let i of bowlingindexes){
                    console.log(parseInt(i)+11)
                    let object = {
                        type:array[k++],
                        m:body.data.stats[parseInt(i)].value, 
                        inn:body.data.stats[parseInt(i)+1].value,
                        w:body.data.stats[parseInt(i)+4].value,
                        r:body.data.stats[parseInt(i)+3].value,
                        bbi:body.data.stats[parseInt(i)+5].value,
                        eco:body.data.stats[parseInt(i)+7].value,
                        fw:body.data.stats[parseInt(i)+10].value,
                        tw:body.data.stats[parseInt(i)+11].value,
                    }
                    bowlingStat.push(object);
                }
                let bowling  = "Do not bowl"
                if(body.data.bowlingStyle != undefined){
                    bowling = body.data.bowlingStyle;
                }
                res.render('playerInfo',{
                    playername:body.data.name,
                    role:body.data.role,
                    country:body.data.country,
                    img:body.data.playerImg,
                    battingStyle:body.data.battingStyle,
                    bowlingStyle:bowling,
                    placeOfBirth:body.data.placeOfBirth,
                    battingStat:batting,
                    bowlingStats:bowlingStat
                });
            })
        }
        
    })
    
})

http.createServer(app).listen(8080,()=>{
    console.log('Running on 8080')
});  