#!/bin/sh

manage_package() {
    local name="$1"
    local autostart="$2"
    local process="$3"

    # Проверка, установлен ли пакет
    if opkg list-installed | grep -q "^$name"; then
        
        # Проверка, включен ли автозапуск
        if /etc/init.d/$name enabled; then
            if [ "$autostart" = "disable" ]; then
                /etc/init.d/$name disable
            fi
        else
            if [ "$autostart" = "enable" ]; then
                /etc/init.d/$name enable
            fi
        fi

        # Проверка, запущен ли процесс
        if pidof $name > /dev/null; then
            if [ "$process" = "stop" ]; then
                /etc/init.d/$name stop
            fi
        else
            if [ "$process" = "start" ]; then
                /etc/init.d/$name start
            fi
        fi
    fi
}

checkPackageAndInstall() {
    local name="$1"
    local isRequired="$2"
    local alt=""

    if [ "$name" = "https-dns-proxy" ]; then
        alt="luci-app-doh-proxy"
    fi

    if [ -n "$alt" ]; then
        if opkg list-installed | grep -qE "^($name|$alt) "; then
            echo "$name or $alt already installed..."
            return 0
        fi
    else
        if opkg list-installed | grep -q "^$name "; then
            echo "$name already installed..."
            return 0
        fi
    fi

    echo "$name not installed. Installing $name..."
    opkg install "$name"
    res=$?

    if [ "$isRequired" = "1" ]; then
        if [ $res -eq 0 ]; then
            echo "$name installed successfully"
        else
            echo "Error installing $name. Please, install $name manually$( [ -n "$alt" ] && echo " or $alt") and run the script again."
            exit 1
        fi
    fi
}

checkAndAddDomainPermanentName()
{
  nameRule="option name '$1'"
  str=$(grep -i "$nameRule" /etc/config/dhcp)
  if [ -z "$str" ] 
  then 

    uci add dhcp domain
    uci set dhcp.@domain[-1].name="$1"
    uci set dhcp.@domain[-1].ip="$2"
    uci commit dhcp
  fi
}

byPassGeoBlockComssDNS()
{
	echo "Configure dhcp..."

	uci set dhcp.cfg01411c.strictorder='1'
	uci set dhcp.cfg01411c.filter_aaaa='1'
	uci add_list dhcp.cfg01411c.server='127.0.0.1#5053'
	uci add_list dhcp.cfg01411c.server='127.0.0.1#5054'
	uci add_list dhcp.cfg01411c.server='127.0.0.1#5055'
	uci add_list dhcp.cfg01411c.server='127.0.0.1#5056'
	uci add_list dhcp.cfg01411c.server='/*.chatgpt.com/127.0.0.1#5056'
	uci add_list dhcp.cfg01411c.server='/*.oaistatic.com/127.0.0.1#5056'
	uci add_list dhcp.cfg01411c.server='/*.oaiusercontent.com/127.0.0.1#5056'
	uci add_list dhcp.cfg01411c.server='/*.openai.com/127.0.0.1#5056'
	uci add_list dhcp.cfg01411c.server='/*.microsoft.com/127.0.0.1#5056'
	uci add_list dhcp.cfg01411c.server='/*.windowsupdate.com/127.0.0.1#5056'
	uci add_list dhcp.cfg01411c.server='/*.bing.com/127.0.0.1#5056'
	uci add_list dhcp.cfg01411c.server='/*.supercell.com/127.0.0.1#5056'
	uci add_list dhcp.cfg01411c.server='/*.seeurlpcl.com/127.0.0.1#5056'
	uci add_list dhcp.cfg01411c.server='/*.supercellid.com/127.0.0.1#5056'
	uci add_list dhcp.cfg01411c.server='/*.supercellgames.com/127.0.0.1#5056'
	uci add_list dhcp.cfg01411c.server='/*.clashroyale.com/127.0.0.1#5056'
	uci add_list dhcp.cfg01411c.server='/*.brawlstars.com/127.0.0.1#5056'
	uci add_list dhcp.cfg01411c.server='/*.clash.com/127.0.0.1#5056'
	uci add_list dhcp.cfg01411c.server='/*.clashofclans.com/127.0.0.1#5056'
	uci add_list dhcp.cfg01411c.server='/*.x.ai/127.0.0.1#5056'
	uci add_list dhcp.cfg01411c.server='/*.grok.com/127.0.0.1#5056'
	uci add_list dhcp.cfg01411c.server='/*.github.com/127.0.0.1#5056'
	uci add_list dhcp.cfg01411c.server='/*.forzamotorsport.net/127.0.0.1#5056'
	uci add_list dhcp.cfg01411c.server='/*.forzaracingchampionship.com/127.0.0.1#5056'
	uci add_list dhcp.cfg01411c.server='/*.forzarc.com/127.0.0.1#5056'
	uci add_list dhcp.cfg01411c.server='/*.gamepass.com/127.0.0.1#5056'
	uci add_list dhcp.cfg01411c.server='/*.orithegame.com/127.0.0.1#5056'
	uci add_list dhcp.cfg01411c.server='/*.renovacionxboxlive.com/127.0.0.1#5056'
	uci add_list dhcp.cfg01411c.server='/*.tellmewhygame.com/127.0.0.1#5056'
	uci add_list dhcp.cfg01411c.server='/*.xbox.co/127.0.0.1#5056'
	uci add_list dhcp.cfg01411c.server='/*.xbox.com/127.0.0.1#5056'
	uci add_list dhcp.cfg01411c.server='/*.xbox.eu/127.0.0.1#5056'
	uci add_list dhcp.cfg01411c.server='/*.xbox.org/127.0.0.1#5056'
	uci add_list dhcp.cfg01411c.server='/*.xbox360.co/127.0.0.1#5056'
	uci add_list dhcp.cfg01411c.server='/*.xbox360.com/127.0.0.1#5056'
	uci add_list dhcp.cfg01411c.server='/*.xbox360.eu/127.0.0.1#5056'
	uci add_list dhcp.cfg01411c.server='/*.xbox360.org/127.0.0.1#5056'
	uci add_list dhcp.cfg01411c.server='/*.xboxab.com/127.0.0.1#5056'
	uci add_list dhcp.cfg01411c.server='/*.xboxgamepass.com/127.0.0.1#5056'
	uci add_list dhcp.cfg01411c.server='/*.xboxgamestudios.com/127.0.0.1#5056'
	uci add_list dhcp.cfg01411c.server='/*.xboxlive.cn/127.0.0.1#5056'
	uci add_list dhcp.cfg01411c.server='/*.xboxlive.com/127.0.0.1#5056'
	uci add_list dhcp.cfg01411c.server='/*.xboxone.co/127.0.0.1#5056'
	uci add_list dhcp.cfg01411c.server='/*.xboxone.com/127.0.0.1#5056'
	uci add_list dhcp.cfg01411c.server='/*.xboxone.eu/127.0.0.1#5056'
	uci add_list dhcp.cfg01411c.server='/*.xboxplayanywhere.com/127.0.0.1#5056'
	uci add_list dhcp.cfg01411c.server='/*.xboxservices.com/127.0.0.1#5056'
	uci add_list dhcp.cfg01411c.server='/*.xboxstudios.com/127.0.0.1#5056'
	uci add_list dhcp.cfg01411c.server='/*.xbx.lv/127.0.0.1#5056'
	uci add_list dhcp.cfg01411c.server='/*.sentry.io/127.0.0.1#5056'
	uci add_list dhcp.cfg01411c.server='/*.usercentrics.eu/127.0.0.1#5056'
	uci add_list dhcp.cfg01411c.server='/*.recaptcha.net/127.0.0.1#5056'
	uci add_list dhcp.cfg01411c.server='/*.gstatic.com/127.0.0.1#5056'
	uci add_list dhcp.cfg01411c.server='/*.brawlstarsgame.com/127.0.0.1#5056'
	uci commit dhcp

	echo "Add unblock ChatGPT..."

	checkAndAddDomainPermanentName "chatgpt.com" "83.220.169.155"
	checkAndAddDomainPermanentName "openai.com" "83.220.169.155"
	checkAndAddDomainPermanentName "webrtc.chatgpt.com" "83.220.169.155"
	checkAndAddDomainPermanentName "ios.chat.openai.com" "83.220.169.155"
	checkAndAddDomainPermanentName "searchgpt.com" "83.220.169.155"

	service dnsmasq restart
	service odhcpd restart
}

deleteByPassGeoBlockComssDNS()
{
	uci del dhcp.cfg01411c.server
	uci add_list dhcp.cfg01411c.server='127.0.0.1#5359'
	while uci del dhcp.@domain[-1] ; do : ;  done;
	uci commit dhcp
	service dnsmasq restart
	service odhcpd restart
	service doh-proxy restart
}

if [ "$1" = "y" ] || [ "$1" = "Y" ]
then
	is_manual_input_parameters="y"
else
	is_manual_input_parameters="n"
fi
if [ "$2" = "y" ] || [ "$2" = "Y" ] || [ "$2" = "" ]
then
	is_reconfig_podkop="y"
else
	is_reconfig_podkop="n"
fi

#####after
DESCRIPTION=$(ubus call system board | jsonfilter -e '@.release.description')
VERSION=$(ubus call system board | jsonfilter -e '@.release.version')
findKey="OpenWrt"
findVersion="24.10.2"

if echo "$DESCRIPTION" | grep -qi -- "$findKey" && printf '%s\n%s\n' "$findVersion" "$VERSION" | sort -V | tail -n1 | grep -qx -- "$VERSION"; then
	printf "\033[32;1mThis new firmware. Running scprit...\033[0m\n"
else
	printf "\033[32;1mThis old firmware.\nTo use this script, update your firmware to the latest version....\033[0m\n"
	exit 1
fi
####after

echo "Update list packages..."
opkg update

checkPackageAndInstall "coreutils-base64" "1"

encoded_code="IyEvYmluL3NoCgojINCt0YLQviDRgdC60YDQuNC/0YIg0LTQu9GPINC/0YDQvtCy0LXRgNC60Lgg0LzQvtC00LXQu9C4Cm1vZGVsPSQoY2F0IC90bXAvc3lzaW5mby9tb2RlbCkKCiMg0J/RgNC+0LLQtdGA0Y/QtdC8LCDRj9Cy0LvRj9C10YLRgdGPINC70Lgg0LzQvtC00LXQu9GMICJSb3V0ZXIiCmlmICEgZWNobyAiJG1vZGVsIiB8IGdyZXAgLXEgIlJvdXRlciI7IHRoZW4KICAgIGVjaG8gIlRoaXMgc2NyaXB0IGZvciByb3V0ZXJzIFJvdXRlcmljaC4uLiBJZiB5b3Ugd2FudCB0byB1c2UgaXQsIHdyaXRlIHRvIHRoZSBlcCBjaGF0IFRHIEByb3V0ZXJpY2giCiAgICBleGl0IDEKZmkK"
eval "$(echo "$encoded_code" | base64 --decode)"

checkPackageAndInstall "jq" "1"
checkPackageAndInstall "curl" "1"
checkPackageAndInstall "unzip" "1"
checkPackageAndInstall "opera-proxy" "1"
checkPackageAndInstall "zapret" "1"
opkg remove --force-removal-of-dependent-packages "sing-box"

findVersion="1.12.0"
if opkg list-installed | grep "^sing-box-tiny" && printf '%s\n%s\n' "$findVersion" "$VERSION" | sort -V | tail -n1 | grep -qx -- "$VERSION"; then
	printf "\033[32;1mInstalled new sing-box-tiny. Running scprit...\033[0m\n"
else
	printf "\033[32;1mInstalled old sing-box-tiny or not install sing-box-tiny. Reinstall sing-box-tiny...\033[0m\n"
	manage_package "podkop" "enable" "stop"
	opkg remove --force-removal-of-dependent-packages "sing-box-tiny"
	checkPackageAndInstall "sing-box-tiny" "1"
fi

opkg upgrade zapret
opkg upgrade luci-app-zapret
manage_package "zapret" "enable" "start"

#проверяем установлен ли пакет dnsmasq-full
if opkg list-installed | grep -q dnsmasq-full; then
	echo "dnsmasq-full already installed..."
else
	echo "Installed dnsmasq-full..."
	cd /tmp/ && opkg download dnsmasq-full
	opkg remove dnsmasq && opkg install dnsmasq-full --cache /tmp/

	[ -f /etc/config/dhcp-opkg ] && cp /etc/config/dhcp /etc/config/dhcp-old && mv /etc/config/dhcp-opkg /etc/config/dhcp
fi

#проверяем установлен ли пакет https-dns-proxy
if opkg list-installed | grep -q https-dns-proxy; then
	echo "Delete packet https-dns-proxy..."
	opkg remove --force-removal-of-dependent-packages "https-dns-proxy"
fi

printf "Setting confdir dnsmasq\n"
uci set dhcp.@dnsmasq[0].confdir='/tmp/dnsmasq.d'
uci commit dhcp

DIR="/etc/config"
DIR_BACKUP="/root/backup5"
config_files="network
firewall
doh-proxy
zapret
dhcp
dns-failsafe-proxy
stubby"
#URL="https://raw.githubusercontent.com/routerich/RouterichAX3000_configs/refs/heads/podkop07"
URL="https://raw.githubusercontent.com/oblomo-f/Xiaomi-AX3000T_config/refs/heads/podkop"

checkPackageAndInstall "luci-app-dns-failsafe-proxy" "1"
checkPackageAndInstall "luci-i18n-stubby-ru" "1"
checkPackageAndInstall "luci-i18n-doh-proxy-ru" "1"

if [ ! -d "$DIR_BACKUP" ]
then
    echo "Backup files..."
    mkdir -p $DIR_BACKUP
    for file in $config_files
    do
        cp -f "$DIR/$file" "$DIR_BACKUP/$file"  
    done
	echo "Replace configs..."

	for file in $config_files
	do
		if [ "$file" == "doh-proxy" ] || [ "$file" == "dns-failsafe-proxy" ] || [ "$file" == "stubby" ]
		then 
		  wget -O "$DIR/$file" "$URL/config_files/$file" 
		fi
	done
fi

echo "Configure dhcp..."

uci set dhcp.cfg01411c.strictorder='1'
uci set dhcp.cfg01411c.filter_aaaa='1'
uci commit dhcp

cat <<EOF > /etc/sing-box/config.json
{
	"log": {
	"disabled": true,
	"level": "error"
},
"inbounds": [
	{
	"type": "tproxy",
	"listen": "::",
	"listen_port": 1100,
	"sniff": false
	}
],
"outbounds": [
	{
	"type": "http",
	"server": "127.0.0.1",
	"server_port": 18080
	}
],
"route": {
	"auto_detect_interface": true
}
}
EOF

echo "Setting sing-box..."
uci set sing-box.main.enabled='1'
uci set sing-box.main.user='root'
uci add_list sing-box.main.ifaces='wan'
uci add_list sing-box.main.ifaces='wan2'
uci add_list sing-box.main.ifaces='wan6'
uci add_list sing-box.main.ifaces='wwan'
uci add_list sing-box.main.ifaces='wwan0'
uci add_list sing-box.main.ifaces='modem'
uci add_list sing-box.main.ifaces='l2tp'
uci add_list sing-box.main.ifaces='pptp'
uci commit sing-box

nameRule="option name 'Block_UDP_443'"
str=$(grep -i "$nameRule" /etc/config/firewall)
if [ -z "$str" ] 
then
  echo "Add block QUIC..."

  uci add firewall rule # =cfg2492bd
  uci set firewall.@rule[-1].name='Block_UDP_80'
  uci add_list firewall.@rule[-1].proto='udp'
  uci set firewall.@rule[-1].src='lan'
  uci set firewall.@rule[-1].dest='wan'
  uci set firewall.@rule[-1].dest_port='80'
  uci set firewall.@rule[-1].target='REJECT'
  uci add firewall rule # =cfg2592bd
  uci set firewall.@rule[-1].name='Block_UDP_443'
  uci add_list firewall.@rule[-1].proto='udp'
  uci set firewall.@rule[-1].src='lan'
  uci set firewall.@rule[-1].dest='wan'
  uci set firewall.@rule[-1].dest_port='443'
  uci set firewall.@rule[-1].target='REJECT'
  uci commit firewall
fi

printf "\033[32;1mCheck work zapret.\033[0m\n"
#install_youtubeunblock_packages
opkg upgrade zapret
opkg upgrade luci-app-zapret
manage_package "zapret" "enable" "start"
wget -O "/etc/config/zapret" "$URL/config_files/zapret"
wget -O "/opt/zapret/ipset/zapret-hosts-user.txt" "$URL/config_files/zapret-hosts-user.txt"
wget -O "/opt/zapret/ipset/zapret-hosts-user-exclude.txt" "$URL/config_files/zapret-hosts-user-exclude.txt"
wget -O "/opt/zapret/init.d/openwrt/custom.d/50-stun4all" "$URL/config_files/50-stun4all"
chmod +x "/opt/zapret/init.d/openwrt/custom.d/50-stun4all"

manage_package "podkop" "enable" "stop"
manage_package "youtubeUnblock" "disable" "stop"
service zapret restart

isWorkZapret=0

curl -f -o /dev/null -k --connect-to ::google.com -L -H "Host: mirror.gcr.io" --max-time 120 https://test.googlevideo.com/v2/cimg/android/blobs/sha256:2ab09b027e7f3a0c2e8bb1944ac46de38cebab7145f0bd6effebfe5492c818b6

# Проверяем код выхода
if [ $? -eq 0 ]; then
	printf "\033[32;1mzapret well work...\033[0m\n"
	cronTask="0 4 * * * service zapret restart"
	str=$(grep -i "0 4 \* \* \* service zapret restart" /etc/crontabs/root)
	if [ -z "$str" ] 
	then
		echo "Add cron task auto reboot service zapret..."
		echo "$cronTask" >> /etc/crontabs/root
	fi
	str=$(grep -i "0 4 \* \* \* service youtubeUnblock restart" /etc/crontabs/root)
	if [ ! -z "$str" ]
	then
		grep -v "0 4 \* \* \* service youtubeUnblock restart" /etc/crontabs/root > /etc/crontabs/temp
		cp -f "/etc/crontabs/temp" "/etc/crontabs/root"
		rm -f "/etc/crontabs/temp"
	fi
	isWorkZapret=1
else
	manage_package "zapret" "disable" "stop"
	printf "\033[32;1mzapret not work...\033[0m\n"
	isWorkZapret=0
	str=$(grep -i "0 4 \* \* \* service youtubeUnblock restart" /etc/crontabs/root)
	if [ ! -z "$str" ]
	then
		grep -v "0 4 \* \* \* service youtubeUnblock restart" /etc/crontabs/root > /etc/crontabs/temp
		cp -f "/etc/crontabs/temp" "/etc/crontabs/root"
		rm -f "/etc/crontabs/temp"
	fi
	str=$(grep -i "0 4 \* \* \* service zapret restart" /etc/crontabs/root)
	if [ ! -z "$str" ]
	then
		grep -v "0 4 \* \* \* service zapret restart" /etc/crontabs/root > /etc/crontabs/temp
		cp -f "/etc/crontabs/temp" "/etc/crontabs/root"
		rm -f "/etc/crontabs/temp"
	fi
fi

isWorkOperaProxy=0
printf "\033[32;1mCheck opera proxy...\033[0m\n"
service sing-box restart
curl --proxy http://127.0.0.1:18080 ipinfo.io/ip
if [ $? -eq 0 ]; then
	printf "\033[32;1mOpera proxy well work...\033[0m\n"
	isWorkOperaProxy=1
else
	printf "\033[32;1mOpera proxy not work...\033[0m\n"
	isWorkOperaProxy=0
fi

varByPass=0
isWorkWARP=0

if [ "$isExit" = "1" ]
then
	printf "\033[32;1mAWG WARP well work...\033[0m\n"
	isWorkWARP=1
else
	printf "\033[32;1mAWG WARP not work.....Try opera proxy...\033[0m\n"
	isWorkWARP=0
fi

echo "isWorkZapret = $isWorkZapret, isWorkOperaProxy = $isWorkOperaProxy, isWorkWARP = $isWorkWARP"

if [ "$isWorkZapret" = "1" ] && [ "$isWorkOperaProxy" = "1" ] && [ "$isWorkWARP" = "1" ] 
then
	varByPass=1
elif [ "$isWorkZapret" = "0" ] && [ "$isWorkOperaProxy" = "1" ] && [ "$isWorkWARP" = "1" ] 
then
	varByPass=2
elif [ "$isWorkZapret" = "1" ] && [ "$isWorkOperaProxy" = "1" ] && [ "$isWorkWARP" = "0" ] 
then
	varByPass=3
elif [ "$isWorkZapret" = "0" ] && [ "$isWorkOperaProxy" = "1" ] && [ "$isWorkWARP" = "0" ] 
then
	varByPass=4
elif [ "$isWorkZapret" = "1" ] && [ "$isWorkOperaProxy" = "0" ] && [ "$isWorkWARP" = "0" ] 
then
	varByPass=5
elif [ "$isWorkZapret" = "0" ] && [ "$isWorkOperaProxy" = "0" ] && [ "$isWorkWARP" = "1" ] 
then
	varByPass=6
elif [ "$isWorkZapret" = "1" ] && [ "$isWorkOperaProxy" = "0" ] && [ "$isWorkWARP" = "1" ] 
then
	varByPass=7
elif [ "$isWorkZapret" = "0" ] && [ "$isWorkOperaProxy" = "0" ] && [ "$isWorkWARP" = "0" ] 
then
	varByPass=8
fi

printf  "\033[32;1mRestart service dnsmasq, odhcpd...\033[0m\n"
service dnsmasq restart
service odhcpd restart

path_podkop_config="/etc/config/podkop"
path_podkop_config_backup="/root/podkop"
#URL="https://raw.githubusercontent.com/routerich/RouterichAX3000_configs/refs/heads/podkop07"
URL="https://raw.githubusercontent.com/oblomo-f/Xiaomi-AX3000T_config/refs/heads/podkop"


messageComplete=""

case $varByPass in
1)
	nameFileReplacePodkop="podkopNewNoYoutube"
	printf  "\033[32;1mStop and disabled service 'ruantiblock' and 'youtubeUnblock'...\033[0m\n"
	manage_package "ruantiblock" "disable" "stop"
	manage_package "youtubeUnblock" "disable" "stop"
	service zapret restart
	deleteByPassGeoBlockComssDNS
	messageComplete="ByPass block for Method 1: AWG WARP + zapret + Opera Proxy...Configured completed..."
	;;
2)
	nameFileReplacePodkop="podkopNew"
	printf  "\033[32;1mStop and disabled service 'youtubeUnblock' and 'ruantiblock' and 'zapret'...\033[0m\n"
	manage_package "youtubeUnblock" "disable" "stop"
	manage_package "ruantiblock" "disable" "stop"
	manage_package "zapret" "disable" "stop"
	deleteByPassGeoBlockComssDNS
	messageComplete="ByPass block for Method 2: AWG WARP + Opera Proxy...Configured completed..."
	;;
3)
	nameFileReplacePodkop="podkopNewSecond"
	printf  "\033[32;1mStop and disabled service 'ruantiblock' and youtubeUnblock ...\033[0m\n"
	manage_package "ruantiblock" "disable" "stop"
	manage_package "youtubeUnblock" "disable" "stop"
	wget -O "/opt/zapret/init.d/openwrt/custom.d/50-discord-media" "$URL/config_files/50-discord-media"
	chmod +x "/opt/zapret/init.d/openwrt/custom.d/50-discord-media"
	service zapret restart
	deleteByPassGeoBlockComssDNS
	messageComplete="ByPass block for Method 3: zapret + Opera Proxy...Configured completed..."
	;;
4)
	nameFileReplacePodkop="podkopNewSecondYoutube"
	printf  "\033[32;1mStop and disabled service 'youtubeUnblock' and 'ruantiblock' and 'zapret'...\033[0m\n"
	manage_package "youtubeUnblock" "disable" "stop"
	manage_package "ruantiblock" "disable" "stop"
	manage_package "zapret" "disable" "stop"
	deleteByPassGeoBlockComssDNS
	messageComplete="ByPass block for Method 4: Only Opera Proxy...Configured completed..."
	;;
5)
	nameFileReplacePodkop="podkopNewSecondYoutube"
	printf  "\033[32;1mStop and disabled service 'ruantiblock' and 'podkop' and youtubeunblock...\033[0m\n"
	manage_package "ruantiblock" "disable" "stop"
	manage_package "podkop" "disable" "stop"
	manage_package "youtubeunblock" "disable" "stop"
	wget -O "/opt/zapret/ipset/zapret-hosts-user.txt" "$URL/config_files/zapret-hosts-user-second.txt"
	wget -O "/opt/zapret/init.d/openwrt/custom.d/50-discord-media" "$URL/config_files/50-discord-media"
	chmod +x "/opt/zapret/init.d/openwrt/custom.d/50-discord-media"
	service zapret restart
	byPassGeoBlockComssDNS
	printf "\033[32;1mByPass block for Method 5: zapret + ComssDNS for GeoBlock...Configured completed...\033[0m\n"
	exit 1
	;;
6)
	nameFileReplacePodkop="podkopNewWARP"
	printf  "\033[32;1mStop and disabled service 'youtubeUnblock' and 'ruantiblock' and 'zapret'...\033[0m\n"
	manage_package "youtubeUnblock" "disable" "stop"
	manage_package "ruantiblock" "disable" "stop"
	manage_package "zapret" "disable" "stop"
	byPassGeoBlockComssDNS
	messageComplete="ByPass block for Method 6: AWG WARP + ComssDNS for GeoBlock...Configured completed..."
	;;
7)
	nameFileReplacePodkop="podkopNewWARPNoYoutube"
	printf  "\033[32;1mStop and disabled service 'ruantiblock' and 'youtubeUnblock'...\033[0m\n"
	manage_package "ruantiblock" "disable" "stop"
	manage_package "youtubeUnblock" "disable" "stop"
	wget -O "/opt/zapret/init.d/openwrt/custom.d/50-discord-media" "$URL/config_files/50-discord-media"
	chmod +x "/opt/zapret/init.d/openwrt/custom.d/50-discord-media"
	service zapret restart
	byPassGeoBlockComssDNS
	messageComplete="ByPass block for Method 7: AWG WARP + zapret + ComssDNS for GeoBlock...Configured completed..."
	;;
8)
	printf "\033[32;1mTry custom settings router to bypass the locks... Recomendation buy 'VPS' and up 'vless'\033[0m\n"
	exit 1
	;;
*)
    echo "Unknown error. Please send message in group Telegram t.me/routerich"
	exit 1
esac

PACKAGE="podkop"
REQUIRED_VERSION="v0.7.10-r1"

INSTALLED_VERSION=$(opkg list-installed | grep "^$PACKAGE" | cut -d ' ' -f 3)
if [ -n "$INSTALLED_VERSION" ] && [ "$INSTALLED_VERSION" != "$REQUIRED_VERSION" ]; then
    echo "Version package $PACKAGE not equal $REQUIRED_VERSION. Removed packages..."
    opkg remove --force-removal-of-dependent-packages $PACKAGE
fi

if [ -f "/etc/init.d/podkop" ]; then
	if [ "$is_reconfig_podkop" = "y" ] || [ "$is_reconfig_podkop" = "Y" ]; then
		cp -f "$path_podkop_config" "$path_podkop_config_backup"
		wget -O "$path_podkop_config" "$URL/config_files/$nameFileReplacePodkop" 
		echo "Backup of your config in path '$path_podkop_config_backup'"
		echo "Podkop reconfigured..."
	fi
else

	is_install_podkop="y"
	

	if [ "$is_install_podkop" = "y" ] || [ "$is_install_podkop" = "Y" ]; then
		DOWNLOAD_DIR="/tmp/podkop"
		mkdir -p "$DOWNLOAD_DIR"
                        podkop_files="podkop-v0.7.10-r1-all.ipk
			luci-app-podkop-v0.7.10-r1-all.ipk
			luci-i18n-podkop-ru-0.7.10.ipk"
		for file in $podkop_files
		do
			echo "Download $file..."
			wget -q -O "$DOWNLOAD_DIR/$file" "$URL/podkop_packets/$file"
		done
		opkg install $DOWNLOAD_DIR/podkop*.ipk
		opkg install $DOWNLOAD_DIR/luci-app-podkop*.ipk
		opkg install $DOWNLOAD_DIR/luci-i18n-podkop-ru*.ipk
		rm -f $DOWNLOAD_DIR/podkop*.ipk $DOWNLOAD_DIR/luci-app-podkop*.ipk $DOWNLOAD_DIR/luci-i18n-podkop-ru*.ipk
		wget -O "$path_podkop_config" "$URL/config_files/$nameFileReplacePodkop" 
		echo "Podkop installed.."
	fi
fi

printf  "\033[32;1mStart and enable service 'doh-proxy'...\033[0m\n"
manage_package "doh-proxy" "enable" "start"

str=$(grep -i "0 4 \* \* \* wget -O - $URL/configure_zaprets.sh | sh" /etc/crontabs/root)
if [ ! -z "$str" ]
then
	grep -v "0 4 \* \* \* wget -O - $URL/configure_zaprets.sh | sh" /etc/crontabs/root > /etc/crontabs/temp
	cp -f "/etc/crontabs/temp" "/etc/crontabs/root"
	rm -f "/etc/crontabs/temp"
fi

printf  "\033[32;1mService Podkop and Sing-Box restart...\033[0m\n"
service sing-box enable
service sing-box restart
service podkop enable
service podkop restart

printf "\033[32;1m$messageComplete\033[0m\n\n"

printf "\033[32;1mОбновите PODKOP до последней версии\033[0m\n"
printf "\033[32;1mСсылка ниже, скопируйте ее и запустите в терминале после перезагрузки роутера...\033[0m\n\n"
printf "\033[32;1msh <(wget -O - https://raw.githubusercontent.com/itdoginfo/podkop/refs/heads/main/install.sh)\033[0m\n\n"

printf "\033[31;1mAfter 15 second AUTOREBOOT ROUTER...\033[0m\n"
sleep 15
reboot
