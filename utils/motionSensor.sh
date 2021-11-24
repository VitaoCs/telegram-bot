#!/bin/bash

CHAT_ID=`jq '.ALLOWED_CHAT_ID' ./../keys.json`
TOKEN=`jq '.AUTH_TOKEN' ./../keys.json | tr -d '"'`
CAM_IP=`jq '.ESP32_CAM_IP' ./../keys.json | tr -d '"'`

while true
do
	curl "${CAM_IP}/cam-hi.jpg" -o "a.jpg" --silent
	sleep 1

	curl "${CAM_IP}/cam-hi.jpg" -o "b.jpg" --silent

	RESULT=$(compare -metric RMSE -subimage-search -fuzz 20% a.jpg b.jpg x.jpg 2>&1)
	THRESHOLD=$(echo $RESULT | grep -o -E "[0-9]*\.?" | head -n1 | tr "." " ")

	echo $RESULT
	echo $THRESHOLD

	if [[ $THRESHOLD -gt 3000 ]]
	then
		echo "Motion detected!"
		cp x.jpg difference-a-b.jpg
		curl "https://api.telegram.org/bot${TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=Motion%20detected!";
		curl -X POST "https://api.telegram.org/bot${TOKEN}/sendPhoto?chat_id=${CHAT_ID}" -F photo=@"a.jpg"
		curl -X POST "https://api.telegram.org/bot${TOKEN}/sendPhoto?chat_id=${CHAT_ID}" -F photo=@"b.jpg"
		curl -X POST "https://api.telegram.org/bot${TOKEN}/sendPhoto?chat_id=${CHAT_ID}" -F photo=@"difference-a-b.jpg"
	fi
done
