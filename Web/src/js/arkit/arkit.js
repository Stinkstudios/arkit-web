import EventDispatcher from 'happens';
import { clamp, ARAnchor, ARHitTestResult, ARCamera } from './utils';
import { ARHitTestResultType } from './constants';

const ARKit = new class ARKitInterface {
  constructor() {
    EventDispatcher(this);
  }

  /**
   * Receive the latest frame
   * @param  {Object} json
   */
  onARFrame(json) {
    const data = JSON.parse(json);

    // Parse data strings
    data.camera = ARCamera(data.camera);

    for (let i = 0; i < data.anchors.length; i += 1) {
      data.anchors[i] = ARAnchor(data.anchors[i]);
    }

    this.emit('ARFrame', data);
  }

  /**
   * The ARHitTestResult results
   * @param  {Object} json
   */
  onHitTest(json) {
    const data = JSON.parse(json);

    // Parse data strings
    for (let i = 0; i < data.results.length; i += 1) {
      data.results[i] = ARHitTestResult(data.results[i]);
    }

    this.emit('hitTest', data);
  }

  /**
   * Perform a hitTest
   *
   * Top left is 0,0 Bottom right is 1,1
   *
   * @param  {Number} x
   * @param  {Number} y
   * @param  {Number} [hitType=ARHitTestResultType] The type of test. See https://developer.apple.com/documentation/arkit/arhittestresult.resulttype
   */
  hitTest(x, y, hitType = ARHitTestResultType.featurePoint) {
    const data = {
      action: 'hitTest',
      value: {
        x: clamp(x, 0, 1),
        y: clamp(y, 0, 1)
      },
      hitType
    };
    this.postMessage(data);
  }

  onAnchorsAdded(json) {
    const data = JSON.parse(json);

    for (let i = 0; i < data.anchors.length; i += 1) {
      data.anchors[i] = ARAnchor(data.anchors[i]);
    }

    this.emit('anchorsAdded', data);
  }

  onAnchorsRemoved(json) {
    const data = JSON.parse(json);

    for (let i = 0; i < data.anchors.length; i += 1) {
      data.anchors[i] = ARAnchor(data.anchors[i]);
    }

    this.emit('anchorsRemoved', data);
  }

  onSessionInterupted() {
    this.emit('sessionInterupted');
  }

  onSessionInteruptedEnded() {
    this.emit('sessionInteruptedEnded');
  }

  /**
   * Add an anchor to the scene
   */
  addAnchor() {
    const data = {
      action: 'addAnchor',
      value: null
    };
    this.postMessage(data);
  }

  removeAnchors(identifiers = []) {
    const data = {
      action: 'removeAnchors',
      value: identifiers
    };
    this.postMessage(data);
  }

  /**
   * postMessage to the ViewController
   * @param  {Object} data
   */
  postMessage(data) {
    try {
      window.webkit.messageHandlers.callbackHandler.postMessage(data);
    } catch (err) {
      console.log('The native context does not exist'); // eslint-disable-line
    }
  }
}();

export default ARKit;
window.ARKit = ARKit;
