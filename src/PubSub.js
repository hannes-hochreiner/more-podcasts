export default class PubSub {
  static pub(topic, data) {
    PubSub.ps.publish(topic, data);
  }

  static sub(topic, fun) {
    return PubSub.ps.subscribe(topic, fun);
  }

  static unsub(token) {
    PubSub.ps.unsubscribe(token);
  }

  static prom(topic, data) {
    return new Promise(PubSub._promisedPubSub.bind(null, topic, data));
  }

  static reg(topic, fun) {
    return PubSub.sub(`${topic}.request`, (reqTopic, reqData) => {
      let [realm, component, topic, resReq, id] = reqTopic.split('.');
      let resTopic = `${realm}.${component}.${topic}.response.${id}`;

      try {
        let funRes = fun(realm, component, topic, id, reqData);

        if (funRes && typeof funRes.then === 'function') {
          funRes.catch(err => {
            return {error: err};
          }).then(res => {
            PubSub.pub(resTopic, res);
          });
          return;
        }

        PubSub.pub(resTopic, funRes);
      } catch (e) {
        PubSub.pub(resTopic, {error: e})
      }
    });
  }

  static _promisedPubSub(topic, data, resolve, reject) {
    let requestId = PubSub.uuid();
    let cancelToken = PubSub.sub(`${topic}.response.${requestId}`, (resTopic, resData) => {
      PubSub.unsub(cancelToken);

      if (resData && resData.error) {
        reject(resData.error);
        return;
      }

      resolve(resData);
    });

    PubSub.pub(`${topic}.request.${requestId}`, data);
  }
}
