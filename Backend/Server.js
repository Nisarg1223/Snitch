import app from './src/app.js';
import connecttoDB from './src/config/database.js';
import dns from 'dns';

dns.setServers(["8.8.8.8", "8.8.4.4"]);

dns.setDefaultResultOrder("ipv4first");


const  startServer = async ()=>{

    app.listen('3000',()=>{
    console.log("server is running on port 3000");
})
await connecttoDB();
}
startServer();
