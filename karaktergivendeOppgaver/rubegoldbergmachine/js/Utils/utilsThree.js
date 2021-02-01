import * as THREE from "../../lib/three/build/three.module.js";

/**
 * Plays a sound
 * https://threejs.org/docs/#api/en/audio/Audio
 * @param _path Path to audio file
 * @param _camera THREE.PerspectiveCamera to play sound in
 * @param _loopEnabled True for repeating of audio
 * @param _volume 0.0 -> 1.0 (max)
 * @returns {Audio} THREE.Audio
 * @private
 */
export function _playSound(_path, _camera, _loopEnabled=false, _volume=0.5) {
    // create an AudioListener and add it to the camera
    var listener = new THREE.AudioListener();
    _camera.add(listener);
    // create a global audio source
    let sound = new THREE.Audio(listener);
    // load a sound and set it as the Audio object's buffer
    var audioLoader = new THREE.AudioLoader();
    audioLoader.load(_path, function (buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(_loopEnabled);
        sound.setVolume(_volume);
        sound.play();
    });
    // this.soundPlayed = true;

    return sound;
}
