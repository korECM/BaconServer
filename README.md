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
docker pull jeffyoun/bacon_server:latest
```
