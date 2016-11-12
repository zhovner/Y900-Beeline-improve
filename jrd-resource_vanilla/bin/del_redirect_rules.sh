#!/bin/sh
#
# Called from udev
#
# add by Min for timinternet portal
CUST_IP_addr=$(cat /etc/timinternet_ip)
iptables -t nat -D PREROUTING -p udp --dport 53 -j REDIRECT --to-port 54
iptables -t nat -D PREROUTING -d 192.168.0.0/16 -j ACCEPT
iptables -t nat -D PREROUTING -p tcp --dport 80 -j DNAT --to-destination "$CUST_IP_addr":80

