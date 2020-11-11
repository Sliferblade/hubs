import React, { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { FormattedMessage } from "react-intl";
import styles from "../assets/stylesheets/rtc-debug-panel.scss";

const TransportType = {
  SEND: "send_transport",
  RECEIVE: "receive_transport"
};

const StatsType = {
  INBOUND_RTP: "inbound-rtp",
  OUTBOUND_RTP: "outbound-rtp",
  LOCAL_CANDIDATE: "local-candidate",
  REMOTE_CANDIDATE: "remote-candidate",
  CANDIDATE_PAIR: "candidate-pair"
};

const STATS_REFRESH_TIME = 500;
const PRODUCERS_KEY = "producers";
const CONSUMERS_KEY = "consumers";
const MEDIASOUP_DOC_BASE_URL = "https://mediasoup.org/documentation/v3/libmediasoupclient/api/";
const MDN_DOC_BASE_URL = "https://developer.mozilla.org/en-US/docs/Web/API/";

export class Prop extends Component {
  static propTypes = {
    propKey: PropTypes.string,
    propValue: PropTypes.string
  };

  render() {
    return (
      <p className={classNames(styles.rtcTileText)}>
        {`${this.props.propKey}: `}
        <span className={classNames(styles.rtcValueText)}>{`${this.props.propValue}`}</span>
      </p>
    );
  }
}

export class Button extends Component {
  static propTypes = {
    id: PropTypes.string,
    onClick: PropTypes.func,
    isEnabled: PropTypes.bool
  };

  render() {
    return (
      <button
        disabled={!this.props.isEnabled}
        className={classNames(styles.rtcPanelButton)}
        onClick={this.props.onClick}
      >
        <FormattedMessage id={this.props.id} />
      </button>
    );
  }
}

export class RtpPanel extends Component {
  static propTypes = {
    store: PropTypes.object,
    graphData: PropTypes.array,
    speed: PropTypes.string,
    data: PropTypes.object,
    title: PropTypes.string
  };
  componentDidMount() {
    this.props.store.addEventListener("statechanged", this.storeUpdated);
    document.body.addEventListener("locale-updated", this.storeUpdated);
  }
  componentWillUnmount() {
    this.props.store.removeEventListener("statechanged", this.storeUpdated);
    document.body.removeEventListener("locale-updated", this.storeUpdated);
  }

  storeUpdated = () => {
    this.forceUpdate();
  };

  render() {
    const props = [];
    for (const property in this.props.data) {
      let value = this.props.data[property];
      if (typeof value === "number" && !!(value % 1)) {
        value = value.toFixed(2);
      }
      props.push(<Prop key={property} propKey={`${property}`} propValue={`${value}`} />);
    }
    return (
      <div className={classNames(styles.rtpTile)}>
        <p className={classNames(styles.rtcTileTitle)}>{this.props.title}</p>
        {this.props.graphData && (
          <div style={{ display: "flex", width: "150px", height: "50px", alignSelf: "center" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={this.props.graphData}>
                <Area type="monotone" dataKey="bytesSent" stroke="#00ff00" fill="#00ff00" isAnimationActive={false} />
                <Area type="monotone" dataKey="packetsSent" stroke="#0000ff" fill="#0000ff" isAnimationActive={false} />
                <Area
                  type="monotone"
                  dataKey="bytesReceived"
                  stroke="#00ff00"
                  fill="#00ff00"
                  isAnimationActive={false}
                />
                <Area
                  type="monotone"
                  dataKey="packetsReceived"
                  stroke="#0000ff"
                  fill="#0000ff"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
        {this.props.speed && <Prop propKey={`speed`} propValue={`${this.props.speed} Kb/sec`} />}
        {props}
      </div>
    );
  }
}

export class ProducerPanel extends Component {
  static propTypes = {
    store: PropTypes.object,
    data: PropTypes.object,
    stats: PropTypes.object
  };
  componentDidMount() {
    this.props.store.addEventListener("statechanged", this.storeUpdated);
    document.body.addEventListener("locale-updated", this.storeUpdated);
  }
  componentWillUnmount() {
    this.props.store.removeEventListener("statechanged", this.storeUpdated);
    document.body.removeEventListener("locale-updated", this.storeUpdated);
  }

  storeUpdated = () => {
    this.forceUpdate();
  };

  render() {
    return (
      <div className={classNames(styles.rtpContainerColumnBorder)}>
        <p className={classNames(styles.rtcTileTitle)}>{`${this.props.data.kind} producer`}</p>
        <Prop propKey={`id`} propValue={`${this.props.data.id}`} />
        <Prop propKey={`paused`} propValue={`${this.props.data.paused}`} />
        <Prop propKey={`kind`} propValue={`${this.props.data.kind}`} />
        {this.props.data.track && (
          <RtpPanel key={this.props.data.id} store={this.props.store} data={this.props.data.track} title={`track`} />
        )}
        {this.props.stats && (
          <RtpPanel
            key={this.props.stats.rtpStats[StatsType.OUTBOUND_RTP].id}
            store={this.props.store}
            graphData={this.props.stats.graph.slice()}
            speed={this.props.stats.speed}
            data={this.props.stats.rtpStats[StatsType.OUTBOUND_RTP]}
            title={`stats`}
          />
        )}
      </div>
    );
  }
}

export class ConsumerPanel extends Component {
  static propTypes = {
    store: PropTypes.object,
    data: PropTypes.object,
    stats: PropTypes.object
  };
  componentDidMount() {
    this.props.store.addEventListener("statechanged", this.storeUpdated);
    document.body.addEventListener("locale-updated", this.storeUpdated);
  }
  componentWillUnmount() {
    this.props.store.removeEventListener("statechanged", this.storeUpdated);
    document.body.removeEventListener("locale-updated", this.storeUpdated);
  }

  storeUpdated = () => {
    this.forceUpdate();
  };

  render() {
    return (
      <div className={classNames(styles.rtpTile)}>
        <p className={classNames(styles.rtcTileTitle)}>{`${this.props.data.track.kind} consumer`}</p>
        <Prop propKey={`opened`} propValue={`${this.props.data.opened}`} />
        <Prop propKey={`id`} propValue={`${this.props.data.id}`} />
        {this.props.data.track && (
          <RtpPanel key={this.props.data.id} store={this.props.store} data={this.props.data.track} title={`track`} />
        )}
        {this.props.stats && (
          <RtpPanel
            key={this.props.stats.rtpStats[StatsType.INBOUND_RTP].id}
            store={this.props.store}
            graphData={this.props.stats.graph.slice()}
            speed={this.props.stats.speed}
            data={this.props.stats.rtpStats[StatsType.INBOUND_RTP]}
            title={`stats`}
          />
        )}
      </div>
    );
  }
}

export class TransportPanel extends Component {
  static propTypes = {
    store: PropTypes.object,
    data: PropTypes.object,
    buttonId: PropTypes.string,
    onRestart: PropTypes.func,
    title: PropTypes.string,
    stats: PropTypes.object,
    isButtonEnabled: PropTypes.bool
  };
  componentDidMount() {
    this.props.store.addEventListener("statechanged", this.storeUpdated);
    document.body.addEventListener("locale-updated", this.storeUpdated);
  }
  componentWillUnmount() {
    this.props.store.removeEventListener("statechanged", this.storeUpdated);
    document.body.removeEventListener("locale-updated", this.storeUpdated);
  }

  storeUpdated = () => {
    this.forceUpdate();
  };

  createCandidates() {
    const result = [];
    if (this.props.data?.candidates) {
      this.props.data["candidates"][StatsType.LOCAL_CANDIDATE] &&
        result.push(
          <RtpPanel
            key={StatsType.LOCAL_CANDIDATE}
            store={this.props.store}
            data={this.props.data["candidates"][StatsType.LOCAL_CANDIDATE]}
            title={`Local candidate`}
          />
        );
      this.props.data["candidates"][StatsType.REMOTE_CANDIDATE] &&
        result.push(
          <RtpPanel
            key={StatsType.REMOTE_CANDIDATE}
            store={this.props.store}
            data={this.props.data["candidates"][StatsType.REMOTE_CANDIDATE]}
            title={`Remote candidate`}
          />
        );
    }
    return result;
  }

  render() {
    const candidates = this.createCandidates();
    const producers = [];
    this.props.data?.producers?.forEach(producer => {
      producers.push(
        <ProducerPanel
          key={producer.id}
          store={this.props.store}
          data={producer}
          stats={this.props.stats[producer.id]}
        />
      );
    });
    const reducedConsumers =
      this.props.data?.consumers?.reduce((map, consumer) => {
        map[consumer.peerId] = map[consumer.peerId] || {};
        map[consumer.peerId]["name"] = consumer.name;
        map[consumer.peerId]["peerId"] = consumer.peerId;
        map[consumer.peerId]["consumers"] = map[consumer.peerId]["consumers"] || [];
        map[consumer.peerId]["consumers"].push(consumer);
        return map;
      }, []) || [];
    const consumers = [];
    for (const reducedConsumerId in reducedConsumers) {
      const reducedConsumer = reducedConsumers[reducedConsumerId];
      const panels = [];
      for (const consumerId in reducedConsumer.consumers) {
        const consumer = reducedConsumer.consumers[consumerId];
        panels.push(
          <ConsumerPanel
            key={consumer.id}
            store={this.props.store}
            data={consumer}
            stats={this.props.stats[consumer.id]}
          />
        );
      }
      consumers.push(
        <CollapsiblePanel
          key={reducedConsumer.name}
          title={reducedConsumer.name}
          url={`${MEDIASOUP_DOC_BASE_URL}#Consumer`}
        >
          <p className={classNames(styles.rtcTileSubtitle)}>{`peerId: ${reducedConsumer.peerId}`}</p>
          <CollapsiblePanel row={true} border={false}>
            {panels}
          </CollapsiblePanel>
        </CollapsiblePanel>
      );
    }
    return (
      <CollapsiblePanel
        key={this.props.title}
        title={this.props.title}
        border={true}
        url={`${MEDIASOUP_DOC_BASE_URL}#Transport`}
      >
        <Prop propKey={`id`} propValue={`${this.props.data.id}`} />
        <Prop propKey={`opened`} propValue={`${this.props.data.opened}`} />
        <Prop propKey={`state`} propValue={`${this.props.data.state}`} />
        <Button id={this.props.buttonId} onClick={this.props.onRestart} isEnabled={this.props.isButtonEnabled} />
        {candidates.length > 0 && (
          <CollapsiblePanel
            key={`Candidates`}
            title={`Candidates`}
            row={true}
            url={`${MDN_DOC_BASE_URL}RTCIceCandidate`}
          >
            {candidates}
          </CollapsiblePanel>
        )}
        {producers.length > 0 && (
          <CollapsiblePanel
            key={`Local producers`}
            title={`Local producers`}
            row={true}
            url={`${MEDIASOUP_DOC_BASE_URL}#Producer`}
          >
            {producers}
          </CollapsiblePanel>
        )}
        {consumers}
      </CollapsiblePanel>
    );
  }
}

export class RemotePanel extends Component {
  static propTypes = {
    store: PropTypes.object,
    data: PropTypes.object
  };
  componentDidMount() {
    this.props.store.addEventListener("statechanged", this.storeUpdated);
    document.body.addEventListener("locale-updated", this.storeUpdated);
  }
  componentWillUnmount() {
    this.props.store.removeEventListener("statechanged", this.storeUpdated);
    document.body.removeEventListener("locale-updated", this.storeUpdated);
  }

  storeUpdated = () => {
    this.forceUpdate();
  };

  render() {
    const transports = [];
    if (this.props.data) {
      for (const transportId in this.props.data) {
        const transport = this.props.data[transportId];
        const producers = [];
        if (transport?.producers) {
          for (const producerId in transport.producers) {
            const stats = transport.producers[producerId];
            stats.forEach((stat, index) => {
              producers.push(
                <RtpPanel
                  key={`${producerId}${index}`}
                  store={this.props.store}
                  data={stat}
                  title={`${stat.kind} stats`}
                />
              );
            });
          }
        }
        const consumers = [];
        if (transport?.consumers) {
          for (const consumerId in transport.consumers) {
            const stats = transport.consumers[consumerId];
            stats.forEach((stat, index) => {
              consumers.push(
                <RtpPanel
                  key={`${consumerId}${index}`}
                  store={this.props.store}
                  data={stat}
                  title={`${stat.kind} stats`}
                />
              );
            });
          }
        }
        const stats = [];
        transport?.stats?.forEach((stat, index) => {
          stats.push(<RtpPanel key={index} store={this.props.store} data={stat} title={`Stats`} />);
        });
        transports.push(
          <CollapsiblePanel
            key={transportId}
            title={`${transport.name} Transport`}
            url={`${MDN_DOC_BASE_URL}RTCStatsReport`}
          >
            <Prop key={`transportId`} propKey={`id`} propValue={`${transportId}`} />
            {stats}
            {producers.length > 0 && (
              <CollapsiblePanel
                key={`producers`}
                title={`Producer Stats`}
                row={true}
                wrap={true}
                url={`${MDN_DOC_BASE_URL}RTCStatsReport`}
              >
                {producers}
              </CollapsiblePanel>
            )}
            {consumers.length > 0 && (
              <CollapsiblePanel
                key={`consumers`}
                title={`Consumer Stats`}
                row={true}
                wrap={true}
                url={`${MDN_DOC_BASE_URL}RTCStatsReport`}
              >
                {consumers}
              </CollapsiblePanel>
            )}
          </CollapsiblePanel>
        );
      }
    }
    return (
      <CollapsiblePanel title={"Remote"} isRoot={true}>
        {transports}
      </CollapsiblePanel>
    );
  }
}

export class SignalingPanel extends Component {
  static propTypes = {
    store: PropTypes.object,
    data: PropTypes.object,
    onConnect: PropTypes.func,
    onDisconnect: PropTypes.func
  };
  componentDidMount() {
    this.props.store.addEventListener("statechanged", this.storeUpdated);
    document.body.addEventListener("locale-updated", this.storeUpdated);
  }
  componentWillUnmount() {
    this.props.store.removeEventListener("statechanged", this.storeUpdated);
    document.body.removeEventListener("locale-updated", this.storeUpdated);
  }

  storeUpdated = () => {
    this.forceUpdate();
  };

  render() {
    return (
      <CollapsiblePanel title={"Signaling"} border={true}>
        <Prop propKey={`connected`} propValue={`${this.props.data.connected}`} />
        <Button
          id={
            this.props.data.connected
              ? "rtcDebugPanel.disconnectSignalingButton"
              : "rtcDebugPanel.connectSignalingButton"
          }
          onClick={() => {
            if (this.props.data.connected) {
              this.props.onDisconnect();
            } else {
              this.props.onConnect();
            }
          }}
          isEnabled={true}
        />
      </CollapsiblePanel>
    );
  }
}

export class DevicePanel extends Component {
  static propTypes = {
    store: PropTypes.object,
    data: PropTypes.object
  };
  componentDidMount() {
    this.props.store.addEventListener("statechanged", this.storeUpdated);
    document.body.addEventListener("locale-updated", this.storeUpdated);
  }
  componentWillUnmount() {
    this.props.store.removeEventListener("statechanged", this.storeUpdated);
    document.body.removeEventListener("locale-updated", this.storeUpdated);
  }

  storeUpdated = () => {
    this.forceUpdate();
  };

  render() {
    return (
      <CollapsiblePanel title={"Device"} border={true} url={`${MEDIASOUP_DOC_BASE_URL}#Device`}>
        <Prop propKey={`loaded`} propValue={`${this.props.data.loaded}`} />
        {/* <Prop propKey={`codecs`} propValue={`${this.props.data.codecs}`} /> */}
      </CollapsiblePanel>
    );
  }
}

export class LogPanel extends Component {
  static propTypes = {
    log: PropTypes.array
  };
  componentDidMount() {
    document.body.addEventListener("locale-updated", this.storeUpdated);
  }
  componentWillUnmount() {
    document.body.removeEventListener("locale-updated", this.storeUpdated);
  }

  storeUpdated = () => {
    this.forceUpdate();
  };

  colorForLevel(level) {
    switch (level) {
      case "error":
        return "red";
      case "warn":
        return "orange";
      default:
        return "white";
    }
  }

  render() {
    const logLines = [];
    this.props.log
      ?.slice()
      .reverse()
      .forEach((log, index) => {
        logLines.push(<span key={index << 2} className={classNames(styles.rtcLogTag)}>{`[${log.tag}] `}</span>);
        logLines.push(
          <span
            key={(index << 2) | 0x01}
            className={classNames(styles.rtcLogMsg)}
            style={{ color: this.colorForLevel(log.level) }}
          >
            {log.msg}
          </span>
        );
        logLines.push(<br key={(index << 2) | 0x02} />);
      });
    return (
      <CollapsiblePanel title={"Log"} isRoot={true}>
        <p style={{ userSelect: "text" }}>{logLines}</p>
      </CollapsiblePanel>
    );
  }
}

export class CollapsiblePanel extends Component {
  static propTypes = {
    children: PropTypes.node,
    title: PropTypes.string,
    border: PropTypes.bool,
    row: PropTypes.bool,
    wrap: PropTypes.bool,
    url: PropTypes.string,
    isRoot: PropTypes.bool
  };

  collapse = evt => {
    evt.target.classList.toggle("collapsed");
    evt.target.parentElement?.nextSibling?.classList.toggle("collapsed");
  };

  openLink = () => {
    const win = window.open(this.props.url, "_blank");
    win.focus();
  };

  render() {
    const collapsibleClassName = this.props.isRoot
      ? classNames(styles.rtcStatusCollapsibleContainerRoot)
      : classNames(styles.rtcStatusCollapsibleContainer);
    const rootClassName = this.props.border ? classNames(styles.rtpTile) : classNames(styles.rtcStatusPanel);
    const flow = { flexFlow: (this.props.row ? "row " : "column ") + (this.props.wrap ? "wrap" : "nowrap") };
    return (
      <div className={rootClassName}>
        <div style={{ display: "flex", flexFlow: "row nowrap", justifyContent: "center" }}>
          {this.props.title && (
            <button className={classNames(styles.collapsibleButton)} onClick={this.collapse}>
              {this.props.title}
            </button>
          )}
          {this.props.url && (
            <button className={classNames(styles.helpButton)} onClick={this.openLink}>
              ?
            </button>
          )}
        </div>
        <div className={collapsibleClassName} style={flow}>
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default class RtcDebugPanel extends Component {
  static propTypes = {
    avatarId: PropTypes.string,
    store: PropTypes.object,
    scene: PropTypes.object,
    intl: PropTypes.object,
    presences: PropTypes.object,
    history: PropTypes.object,
    sessionId: PropTypes.string
  };

  constructor() {
    super();

    this.state = {};
  }

  componentDidMount() {
    this.props.scene.addEventListener("rtc_event", this.logEvent);
    this.props.store.addEventListener("statechanged", this.storeUpdated);
    this.runStats(true);
  }

  componentWillUnmount() {
    this.props.scene.removeEventListener("rtc_event", this.logEvent);
    this.props.store.removeEventListener("statechanged", this.storeUpdated);
    this.runStats(false);
  }

  logEvent = e => {
    const currentLog = this.state?.log?.slice() || [];
    currentLog.push(e.detail);
    this.setState({
      log: currentLog
    });
  };

  storeUpdated = () => {
    const showPanel = this.props.store.state.preferences["showRtcDebugPanel"];
    this.setState({ showPanel: showPanel });
  };

  getDeviceData() {
    const result = {};
    const device = NAF.connection.adapter._mediasoupDevice;
    if (device) {
      result["loaded"] = !device._closed ? true : false;
      result["codecs"] = device._recvRtpCapabilities.codecs.map(
        codec => "[" + codec.mimeType + "/" + codec.clockRate + "]"
      );
    }
    return result;
  }

  async getCandidatesData(peer) {
    const result = {};
    const stats = await peer.getStats();
    for (const data of stats.values()) {
      if (data["type"] === StatsType.CANDIDATE_PAIR) {
        const candidatePair = data;
        if (candidatePair && (candidatePair["nominated"] || candidatePair["selected"])) {
          for (const values of stats.values()) {
            if (candidatePair["localCandidateId"] === values["id"]) {
              result[StatsType.LOCAL_CANDIDATE] = values;
            } else if (candidatePair["remoteCandidateId"] === values["id"]) {
              result[StatsType.REMOTE_CANDIDATE] = values;
            }
          }
        }
      }
    }
    return result;
  }

  async getTransportData(type) {
    const result = {};
    let transport;
    if (type === TransportType.SEND) {
      transport = NAF.connection.adapter._sendTransport;
    } else if (type === TransportType.RECEIVE) {
      transport = NAF.connection.adapter._recvTransport;
    }
    const opened = (transport && !transport._closed && true) || false;
    result["opened"] = opened;
    if (transport) {
      result["state"] = transport._connectionState;
      result["id"] = transport._id;
      result[PRODUCERS_KEY] = [];
      result[CONSUMERS_KEY] = [];
      transport._producers.forEach(producer => {
        result[PRODUCERS_KEY].push(this.getProducerData(producer));
      });
      transport._consumers.forEach(consumer => {
        result[CONSUMERS_KEY].push(this.getConsumerData(consumer));
      });
      opened && (result["candidates"] = await this.getCandidatesData(transport));
    }
    return result;
  }

  getProducerData(producer) {
    const result = {};
    if (producer) {
      result["id"] = producer._id;
      result["paused"] = producer._paused;
      result["kind"] = producer._kind;
      result["track"] = this.getTrackData(producer);
    }
    return result;
  }

  profileFromPresence([, data]) {
    const meta = data.metas[data.metas.length - 1];
    return meta.profile;
  }

  profileFromConsumer(consumer) {
    return Object.entries(this.props.presences || {})
      .filter(([k]) => k === consumer._appData.peerId)
      .map(this.profileFromPresence)
      .shift();
  }

  getConsumerData(consumer) {
    const result = {};
    result["opened"] = !consumer._closed;
    if (consumer) {
      const profile = Object.entries(this.props.presences || {})
        .filter(([k]) => k === consumer._appData.peerId)
        .map(this.profileFromPresence)
        .shift();
      result["id"] = consumer._id;
      result["name"] = profile ? profile.displayName : "N/A";
      result["peerId"] = consumer._appData.peerId;
      result["track"] = this.getTrackData(consumer);
    }
    return result;
  }

  getTrackData(owner) {
    const result = {};
    result["id"] = owner._track.id;
    result["enabled"] = (owner._track !== null && owner._track.enabled && true) || false;
    result["kind"] = owner._track.kind;
    result["muted"] = owner._track.muted;
    result["state"] = owner._track.readyState;
    return result;
  }

  getSignalingData() {
    return { connected: !NAF.connection.adapter._closed };
  }

  async getServerData() {
    return await NAF.connection.adapter.getServerStats();
  }

  async getRtpStatsData(peer, type) {
    const result = {};
    const stats = await peer.getStats();
    for (const data of stats.values()) {
      if (data["type"] === type) {
        return data;
      }
    }
    return result;
  }

  getGraphData(id, stats) {
    let lastStats = this.state.statsData && this.state.statsData[id] && this.state.statsData[id]["last"];
    const bytesSent = stats.bytesSent || 0;
    const bytesReceived = stats.bytesReceived || 0;
    const packetsSent = stats.packetsSent || 0;
    const packetsReceived = stats.packetsReceived || 0;
    const timestamp = stats.timestamp || 0;
    const bytesSentDelta = bytesSent - lastStats?.bytesSent || 0;
    const bytesReceivedDelta = bytesReceived - lastStats?.bytesReceived || 0;
    const packetsSentDelta = packetsSent - lastStats?.packetsSent || 0;
    const packetsReceivedDelta = packetsReceived - lastStats?.packetsReceived || 0;
    const timeDelta = timestamp - lastStats?.timestamp || 0;
    let graphData = this.state.statsData && this.state.statsData[id] && this.state.statsData[id]["graph"];
    if (!graphData) {
      const data = new Array(20);
      data.fill({
        bytesSent: 0,
        bytesReceived: 0,
        packetsSent: 0,
        packetsReceived: 0,
        timestamp: 0
      });
      graphData = data;
    }
    graphData.shift();
    graphData.push({
      bytesSent: bytesSentDelta,
      bytesReceived: bytesReceivedDelta,
      packetsSent: packetsSentDelta,
      packetsReceived: packetsReceivedDelta,
      timeDelta: timeDelta
    });
    lastStats = {
      bytesSent,
      bytesReceived,
      packetsSent,
      packetsReceived,
      timestamp
    };
    return {
      lastStats: lastStats,
      graphData: graphData
    };
  }

  getPeerSpeed(id, key) {
    let speed = "0.00";
    const graphData = this.state.statsData && this.state.statsData[id] && this.state.statsData[id]["graph"];
    if (graphData) {
      const lastData = graphData[graphData.length - 1];
      if (lastData) {
        speed = ((lastData[key] / 1024) * (1 / (lastData.timeDelta / 1000)) || 0).toFixed(2);
      }
    }

    return speed;
  }

  async runStats(running) {
    if (running && this.state) {
      const taskId = setInterval(() => {
        (async () => {
          try {
            const deviceData = this.getDeviceData();
            const serverData = await this.getServerData();
            const signalingData = this.getSignalingData();

            // Tranports data
            const transportsData = {};
            transportsData[TransportType.SEND] = await this.getTransportData(TransportType.SEND);
            transportsData[TransportType.RECEIVE] = await this.getTransportData(TransportType.RECEIVE);

            // Populate graph, speed and stats data
            const statsData = {};
            if (NAF.connection.adapter._micProducer) {
              const id = NAF.connection.adapter._micProducer.id;
              const peer = NAF.connection.adapter._micProducer;
              const speedData = this.getPeerSpeed(id, "bytesSent");
              const rtpStatsData = {};
              rtpStatsData[StatsType.OUTBOUND_RTP] = await this.getRtpStatsData(peer, StatsType.OUTBOUND_RTP);
              const { lastStats, graphData } = this.getGraphData(id, rtpStatsData[StatsType.OUTBOUND_RTP]);
              statsData[id] = {};
              statsData[id]["speed"] = speedData;
              statsData[id]["graph"] = graphData;
              statsData[id]["last"] = lastStats;
              statsData[id]["rtpStats"] = rtpStatsData;
            }
            if (NAF.connection.adapter._videoProducer) {
              const id = NAF.connection.adapter._videoProducer.id;
              const peer = NAF.connection.adapter._videoProducer;
              const speedData = this.getPeerSpeed(id, "bytesSent");
              const rtpStatsData = {};
              rtpStatsData[StatsType.OUTBOUND_RTP] = await this.getRtpStatsData(peer, StatsType.OUTBOUND_RTP);
              const { lastStats, graphData } = this.getGraphData(id, rtpStatsData[StatsType.OUTBOUND_RTP]);
              statsData[id] = {};
              statsData[id]["speed"] = speedData;
              statsData[id]["graph"] = graphData;
              statsData[id]["last"] = lastStats;
              statsData[id]["rtpStats"] = rtpStatsData;
            }
            for (const consumer of NAF.connection.adapter._consumers) {
              const id = consumer[0];
              const peer = consumer[1];
              const speedData = this.getPeerSpeed(id, "bytesReceived");
              const rtpStatsData = {};
              rtpStatsData[StatsType.INBOUND_RTP] = await this.getRtpStatsData(peer, StatsType.INBOUND_RTP);
              const { lastStats, graphData } = this.getGraphData(id, rtpStatsData[StatsType.INBOUND_RTP]);
              statsData[id] = {};
              statsData[id]["speed"] = speedData;
              statsData[id]["graph"] = graphData;
              statsData[id]["last"] = lastStats;
              statsData[id]["rtpStats"] = rtpStatsData;
            }

            // Update state
            this.setState({
              signalingData,
              serverData,
              deviceData,
              statsData,
              transportsData
            });
          } catch (e) {
            console.log(`Run Stats error: ${e}`);
          }
        })();
      }, STATS_REFRESH_TIME);
      this.setState({ taskId: taskId });
    } else {
      clearInterval(this.state.taskId);
    }
  }

  restartSendICE() {
    NAF.connection.adapter.restartSendICE();
  }

  restartRecvICE() {
    NAF.connection.adapter.restartRecvICE();
  }

  connectSignaling() {
    NAF.connection.adapter.connect();
  }

  disconnectSignaling() {
    NAF.connection.adapter.disconnect();
  }

  render() {
    const { signalingData, serverData, statsData, deviceData, transportsData } = this.state;
    const consumers = [];
    NAF.connection.adapter._consumers.forEach(consumer => {
      if (statsData && statsData[consumer.id]) {
        consumers.push(
          <RtpPanel
            key={consumer.id}
            store={this.props.store}
            graphData={statsData[consumer.id].graph.slice()}
            speed={statsData[consumer.id].speed}
            data={statsData[consumer.id].rtpStats[StatsType.INBOUND_RTP]}
            title={`${this.profileFromConsumer(consumer)?.displayName || "Unknown"}`}
          />
        );
      }
    });
    return (
      <div>
        <div className={classNames(styles.rtcDebugPanelRoot)}>
          <div className={classNames(styles.rtcStatusContainer)}>
            <CollapsiblePanel title={"Local"} isRoot={true}>
              {deviceData && <DevicePanel store={this.props.store} data={deviceData} />}
              {signalingData && (
                <SignalingPanel
                  store={this.props.store}
                  data={signalingData}
                  onConnect={this.connectSignaling}
                  onDisconnect={this.disconnectSignaling}
                />
              )}
              {transportsData &&
                transportsData[TransportType.SEND] && (
                  <div style={{ display: "flex", flexFlow: "column" }}>
                    <TransportPanel
                      store={this.props.store}
                      title={`Send Transport`}
                      data={transportsData[TransportType.SEND]}
                      stats={statsData}
                      onRestart={this.restartSendICE}
                      buttonId={"rtcDebugPanel.restartIceButton"}
                      isButtonEnabled={
                        transportsData[TransportType.SEND].opened &&
                        transportsData[TransportType.SEND].state === "connected"
                      }
                    />
                  </div>
                )}
              {transportsData &&
                transportsData[TransportType.RECEIVE] && (
                  <div style={{ display: "flex", flexFlow: "column" }}>
                    <TransportPanel
                      store={this.props.store}
                      title={`Receive Transport`}
                      data={transportsData[TransportType.RECEIVE]}
                      stats={statsData}
                      onRestart={this.restartRecvICE}
                      buttonId={"rtcDebugPanel.restartIceButton"}
                      isButtonEnabled={
                        transportsData[TransportType.RECEIVE].opened &&
                        transportsData[TransportType.RECEIVE].state === "connected"
                      }
                    />
                  </div>
                )}
            </CollapsiblePanel>
          </div>
          <div className={classNames(styles.rtcLogContainer)}>
            <LogPanel log={this.state.log} />
          </div>
          <div className={classNames(styles.rtcStatusContainer)}>
            <RemotePanel store={this.props.store} data={serverData} />
          </div>
        </div>
      </div>
    );
  }
}
