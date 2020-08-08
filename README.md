# BaconServer

## Build
```bash
docker build -t bacon_server .  
docker tag bacon_server:latest jeffyoun/bacon_server:latest 
docker push jeffyoun/bacon_server:latest


docker create --name bacon_server -p 8001:8001 bacon_server:latest
```


## Run
```bash
sudo docker stop bacon_server && sudo docker rm bacon_server && sudo docker rmi $(docker images -q) && sudo docker create --name bacon_server -p 8001:8001 jeffyoun/bacon_server:latest && sudo docker start bacon_server && sudo service nginx restart
```
