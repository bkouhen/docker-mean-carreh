cd /var/app
docker swarm init
docker stack deploy -c docker-compose.yml -c docker-compose.prod.yml docker-mean