const http = require('http');
const fs = require('fs');
const WebSocketServer = require('websocket').server;

const PORT = 8000;

const server = http.createServer((request,response)=>{
  const url= request.url;
  switch (url){
    case '/':
      fs.readFile('./public/index.html','utf-8',(error,data)=>{
        response.writeHead(200,{'Content-Type':'text/html'});
        response.write(data);
        response.end();
      });
      break;
    
    default:
      response.writeHead(404);
      response.end();
  }
});

server.listen(PORT,()=>{
  console.log(`${new Date()} サーバー起動　http://localhost:${PORT}`);
});

const wsServer = new WebSocketServer({
  httpServer:server,
  autoAcceptConnections: false,
});

const originIsAllowed = (origin)=>{
  
  return true;
}

wsServer.on('request',(request)=>{
  if(!originIsAllowed(request.origin)){
    request.reject();
    console.log(`${new Date()} ${request.origin} からのアクセスが拒否されました`);
  }
  const connection = request.accept('ws-sample', request.origin);
  console.log(`${new Date()} 接続が許可されました.\n ${request.origin}`);

  connection.on('message', message => {
    switch (message.type) {
      case 'utf8':
        console.log(`メッセージ: ${message.utf8Data}\nfrom ${request.origin}`)
        // connection.sendUTF(message.utf8Data)
        wsServer.broadcast(`${message.utf8Data}\nfrom ${request.origin}`) 
        break
      case 'binary':
        console.log(`バイナリデータ: ${message.binaryData.length}byte`)
        connection.sendBytes(message.binaryData)
        break
    }
  });

  connection.on('close',(reasonCode, description)=>{
    console.log(`${new Date()} ${connection.remoteAddress} が切断されました`);
  });
})