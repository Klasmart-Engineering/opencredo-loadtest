#!/usr/bin/env bash

NR_INSIGHTS_COLLECTOR="insights-collector"
NR_INSIGHTS_DOMAIN="eu01.nr-data.net"
NR_METRICS_COLLECTOR="metric-api"
NR_METRICS_DOMAIN="eu.newrelic.com"

if [ -z "${NR_STATSD_METRICS_ADDR}" ]; then
    NR_STATSD_METRICS_ADDR=":8125"
fi

NR_STATSD_CFG=${PWD}/nri-statsd.toml

/bin/cat <<EOM >${NR_STATSD_CFG}
backends='newrelic'
metrics-addr=":8125"
expiry-interval = '1ms'
percent-threshold = [90, 95, 99, 99.99]

[newrelic]
flush-type = "metrics"
transport = "default"
address = "https://${NR_INSIGHTS_COLLECTOR}.${NR_INSIGHTS_DOMAIN}/v1/accounts/${NEW_RELIC_ACCOUNT_ID}/events"
address-metrics = "https://${NR_METRICS_COLLECTOR}.${NR_METRICS_DOMAIN}/metric/v1"
api-key = "${NEW_RELIC_API_KEY}" 
EOM