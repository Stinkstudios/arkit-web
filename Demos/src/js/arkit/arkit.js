import 'object.observe';
import EventDispatcher from 'happens';
import Observed from 'observed';
import { clamp } from './utils';
import { ARHitTestResultType } from './constants';
import ARConfig from './config';

const ARKit = new class ARKitInterface {
  constructor() {
    EventDispatcher(this);
    const observer = Observed(ARConfig);
    observer.on('change', this.updateConfig);
  }

  /**
   * Receive the latest frame
   * @param  {Object} json
   */
  onARFrame(json) {
    this.emit('frame', JSON.parse(json));
  }

  /**
   * The ARHitTestResult results
   * @param  {Object} json
   */
  onHitTest(json) {
    this.emit('hitTest', JSON.parse(json));
  }

  /**
   * The new anchors added
   * @param  {Object} json
   */
  onAnchorsAdded(json) {
    this.emit('anchorsAdded', JSON.parse(json));
  }

  /**
   * The anchors which have been removed
   * @param  {Object} json
   */
  onAnchorsRemoved(json) {
    this.emit('anchorsRemoved', JSON.parse(json));
  }

  /**
   * When the session has been interputed
   */
  onSessionInterupted() {
    this.emit('sessionInterupted');
  }

  /**
   * When the session interruption ends
   */
  onSessionInteruptedEnded() {
    this.emit('sessionInteruptedEnded');
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

  /**
   * Remove anchors from the scene
   * @param {Array} a list of anchor identifiers
   */
  removeAnchors(identifiers = []) {
    const data = {
      action: 'removeAnchors',
      value: identifiers
    };
    this.postMessage(data);
  }

  loadPage(value) {
    const data = {
      action: 'loadPage',
      value
    };
    this.postMessage(data);
  }

  /**
   * Whenever the config changes, update the native ARConfig
   */
  updateConfig = () => {
    const data = {
      action: 'config',
      value: ARConfig
    };
    this.postMessage(data);
  };

  /**
   * postMessage to the ViewController
   * @param  {Object} data
   */
  postMessage(data) {
    try {
      window.webkit.messageHandlers.callbackHandler.postMessage(data);
    } catch (err) {
      console.warn('Error posting to webkit callback handler'); // eslint-disable-line
    }
  }
}();

export default ARKit;
window.ARKit = ARKit;
