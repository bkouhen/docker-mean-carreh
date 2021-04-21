FROM ubuntu
RUN apt-get update && apt-get install rsyslog -y
RUN mkdir /var/log/dockerlogs

RUN echo '$ModLoad imudp \n\
$UDPServerRun 514 \n\
$ModLoad imtcp \n\
$InputTCPServerRun 514 \n\
$IncludeConfig /etc/rsyslog.d/*.conf \n\
$template DockerLogs, "/var/log/dockerlogs/docker-combined.log" \n\
:source, !isequal, "localhost" -?DockerLogs \n\
:source, isequal, "last" ~ ' > /etc/rsyslog.conf

# RUN echo '$template DockerContainerLogs, "/var/log/dockerlogs/%hostname%/%syslogtag:R,ERE,1,ZERO:.*container_name/([^\[]+)--end%.log" \n\
# if $syslogtag contains "container_name" then -?DockerContainerLogs ' > /etc/rsyslog.d/10-docker.conf

RUN echo '$template DockerContainerLogs, "/var/log/dockerlogs/%programname%/%programname%.log" \n\
if $programname startswith "docker" then -?DockerContainerLogs ' > /etc/rsyslog.d/10-docker.conf

RUN echo 'su root adm \n\
/var/log/dockerlogs/docker-*/docker-*.log \n\
/var/log/dockerlogs/docker-combined.log { \n\
    copytruncate \n\
    compress \n\
    dateext \n\
    dateformat -%Y%m%d-%s \n\
    size 20M \n\
    daily \n\
    missingok \n\
    rotate 30 \n\
} ' > /etc/logrotate.d/docker.conf

ENTRYPOINT [ "rsyslogd", "-n" ]