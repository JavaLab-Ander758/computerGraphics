import * as THREE from "../../../lib/three/build/three.module.js";
import {toRadians} from '../../Utils/utils.js';

let textFont = undefined;
let meshBufferArray = []

/**
 * Based on /del6-2020/convexAndText1.html
 */
export class Text {
    constructor(scene) {
        this.scene = scene;

        this.mesh = undefined;
        this.lastTextChangeDeltaTime = 0
    }

    /**
     * Creates text and adds it to the scene
     */
    create(_text="N/A", _position={x:0, y:0, z:0},
           _textSize=80, _rotation={x:0, y:0, z:0},
           _bevelSize=2, _bevelThickness=1, _height=5, __previousIdReference){

        let paramBuffer = {
            position: _position,
            textSize: _textSize,
            rotation: _rotation,
            bevelSize: _bevelSize,
            bevelThickness: _bevelThickness,
            height: _height}

        let _scene = this.scene

        if (textFont === undefined) {
            // Load text to scene if not already done
            let loader = new THREE.FontLoader();
            loader.load('./assets/fonts/helvetiker_regular.typeface.json', function (response) {
                textFont = response;
                createTextCallBack(textFont,
                    _text, _position,
                    _textSize, _rotation,
                    _bevelSize, _bevelThickness);
            });
        } else {
            // Font already loaded, continue
            createTextCallBack(textFont,
                _text, _position,
                _textSize, _rotation,
                _bevelSize, _bevelThickness, __previousIdReference);
        }


        /**
         * To be called if THREE.FontLoader already loaded to improve performance
         */
        function createTextCallBack(_textFont, _text, _position, _textSize, _rotation, _bevelSize, _bevelThickness, __previousIdReference) {
            //Fortsetter;
            let options = {
                font: _textFont,
                size: _textSize,
                height: _height,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: _bevelThickness,
                bevelSize: _bevelSize,
                bevelOffset: 0,
                bevelSegments: 5
            };

            let gText = new THREE.TextGeometry(_text, options);
            let mText = new THREE.MeshLambertMaterial({color: 0xff6611, side: THREE.DoubleSide});
            let meshText = new THREE.Mesh(gText, mText);
            meshText.position.set(_position.x, _position.y, _position.z);
            meshText.rotation.set(toRadians(_rotation.x), toRadians(_rotation.y), toRadians(_rotation.z));
            _scene.add(meshText);

            // Legg til ny eller endre eksisterende dersom endring av tekst
            if (__previousIdReference===undefined)
                meshBufferArray.push([meshText, _text, paramBuffer])
            else
                meshBufferArray[__previousIdReference] = [meshText, _text, paramBuffer]

            mText.dispose()
            gText.dispose()
        }
    }

    /**
     * Changes text of THREE.Text meshes in scene and replaces the text
     * @param _textString String to change to
     * @param _previousTextReference Previous string for reference
     *      To be stored externally if text needs to change in future
     */
    changeExistingText(_textString='N/A', _previousTextReference) {
        for (let i=0; i<meshBufferArray.length; i++) {
            if (meshBufferArray[i][1]+''.localeCompare(_previousTextReference+'')) {

                // Delete previous mesh
                this.scene.remove(meshBufferArray[i][0])
                // Create new and feed previous array index
                if (Date.now() - this.lastTextChangeDeltaTime > 250) {
                    this.create(_textString+'',
                        meshBufferArray[i][2].position,
                        meshBufferArray[i][2].textSize,
                        meshBufferArray[i][2].rotation,
                        meshBufferArray[i][2].bevelSize,
                        meshBufferArray[i][2].bevelThickness,
                        meshBufferArray[i][2].height,
                        i)
                }
                i=meshBufferArray.length+1
            }
        }
    }
}