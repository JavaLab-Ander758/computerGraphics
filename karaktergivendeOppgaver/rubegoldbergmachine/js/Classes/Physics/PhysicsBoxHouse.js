'use strict';
import * as THREE from '../../../lib/three/build/three.module.js';
import {createTriangleMeshShape} from "../../Utils/utilsAmmo.js";
import {getRandomInt, toRadians} from "../../Utils/utils.js";
import * as CONST from "../../Utils/Constants.js";
import {Text} from "./Text.js";

/**
 * Based on /del3-2020-OO from Modul 7
 * @author Anders Rubach Ese <aes014@uit.no>
 */
export class PhysicsBoxHouse {
    constructor(physicsWorld, scene) {
        this.scene = scene;
        this.physicsWorld = physicsWorld;

        this.rigidBody = undefined;
        this.mesh = undefined;
        this.meshBuffer  =[]
    }

    createBoxWall(position = {x:0,y:410,z:0}) {
        let colGroupSelf = CONST.CollisionGroups.Box,
            colGroupToCollideWith = CONST.CollisionMasks.Box

        let width = 30, boxSize = 2, numOfBoxesInHeight=10
        let text = new Text(this.scene)
        text.create('Fine bokser!', {x:position.x-15, y:position.y+22, z:position.z+3}, 3, {x:0, y:0, z:0}, 0.1, 0.1)


        let materials = [];
        let assetRoot = './assets/textures/OpenGameArt/BoxHouse/';
        let assets = ['christmas-wreath.png', 'present-gift-box-reward-full.png', 'pango.png', 'santa_1.png'];
        for (let i=0; i<assets.length; i++)
            materials.push(new THREE.MeshPhongMaterial({map: new THREE.TextureLoader().load(assetRoot+assets[i])}))

        let walls = []

        let wallGeometry = new THREE.BoxBufferGeometry(width, 0.5, boxSize*1.5)
        let rootMesh = new THREE.Mesh(wallGeometry, new THREE.MeshBasicMaterial({color: 0xffff00, wireframe:true}))
        rootMesh.position.set(position.x,position.y,position.z)
        walls.push(rootMesh)
        wallGeometry = new THREE.BoxBufferGeometry(0.5, boxSize*numOfBoxesInHeight, boxSize*1.5)
        let invisibleWallMesh = new THREE.Mesh(wallGeometry, new THREE.MeshBasicMaterial({opacity: 0}))
        invisibleWallMesh.position.set(position.x-width/2-0.5/2, position.y+(boxSize*numOfBoxesInHeight)/2, position.z)
        walls.push(invisibleWallMesh)
        let invisibleWallMeshRight = new THREE.Mesh(wallGeometry, new THREE.MeshBasicMaterial({opacity: 0}))
        invisibleWallMeshRight.position.set(position.x+width/2+0.5/2, position.y+(boxSize*numOfBoxesInHeight)/2, position.z)
        walls.push(invisibleWallMeshRight)
        for (let i=0; i<walls.length; walls[i].material.transparent=true, i++)
            createTriangleMeshShape(this.scene, walls[i], 0, this.physicsWorld, colGroupSelf, colGroupToCollideWith)


        let curPos = {x:position.x-width/2+0.5/2+boxSize/2, y:position.y+1, z:position.z}
        for (let i=0; i<numOfBoxesInHeight; i++) {
            for (let k=0; k<Math.floor(width/boxSize)-1; k++) {
                let geometry = new THREE.BoxBufferGeometry(boxSize, boxSize, boxSize)
                let mesh = new THREE.Mesh(geometry, materials[getRandomInt(0, materials.length)])
                mesh.position.set(curPos.x, curPos.y, curPos.z)
                createTriangleMeshShape(this.scene, mesh, 0.2, this.physicsWorld, colGroupSelf, colGroupToCollideWith)
                curPos.x += boxSize+0.1
            }
            curPos.x  = position.x-width/2+0.5/2+boxSize/2
            curPos.y += boxSize+0.1
        }
    }
    createBoxHouse(position={x:0,y:0,z:0}){
        //{x:-60,y:-70,z:260})
        //posX
        this.createPlane(100,100, {x:position.x+50,y:position.y+0,z:position.z+25}, {x:0,y:90,z:0}, true)
        //negX
        this.createPlane(100,100, {x:position.x-50,y:position.y+0,z:position.z+25}, {x:0,y:-90,z:0}, true)
        //posY
        this.createPlane(100,100, {x:position.x+0,y:position.y+50,z:position.z+25}, {x:90,y:0,z:0}, true)
        //negY
        this.createPlane(100,100, {x:position.x+0,y:position.y-50,z:position.z+25}, {x:-90,y:0,z:0}, true)
        //posZ
        this.createPlane(100,100, {x:position.x+0,y:position.y+0,z:position.z+75}, {x:0,y:0,z:0}, true)
        //negZL
        this.createPlane(40,10, {x:position.x-30,y:position.y+15,z:position.z-25}, {x:0,y:0,z:0}, false) //<-- Workaround for unexplained Ammo-behaviour...
        //negZR
        this.createPlane(40,10, {x:position.x+30,y:position.y+15,z:position.z-25}, {x:0,y:0,z:0}, false)
        //negZT
        this.createPlane(100,30, {x:position.x+0,y:position.y+35,z:position.z-25}, {x:0,y:0,z:0}, false)
        //negZB
        this.createPlane(100,60, {x:position.x+0,y:position.y-20,z:position.z-25}, {x:0,y:0,z:0}, true)
    }
    createChristmasLights(){}

    createPlane(_width=1, _length=1,pos={x:0,y:0,z:0}, rot={x:0,y:0,z:0}/* rotX, rotY, rotZ*/, physics= true){
        let colGroupSelf = CONST.CollisionGroups.Plane,
            colGroupToCollideWith = CONST.CollisionMasks.Plane;

        let tempGeometry = new THREE.PlaneBufferGeometry(_width, _length);
        let tempMaterial = new THREE.MeshPhongMaterial({map: new THREE.TextureLoader().load('assets/textures/OpenGameArt/wood 2.jpg'),
        side: THREE.DoubleSide,
        /*wireframe: true*/})
        let tempMesh = new THREE.Mesh(tempGeometry, tempMaterial)
        tempMesh.castShadow=true
        tempMesh.position.set(pos.x, pos.y, pos.z);
        tempMesh.rotation.set(toRadians(rot.x),toRadians(rot.y),toRadians(rot.z));

        //Workaround for unexplained Ammo-behaviour...
        if(physics)
            createTriangleMeshShape(this.scene, tempMesh, 0, this.physicsWorld, colGroupSelf, colGroupToCollideWith)
        else{
            tempMesh.receiveShadow = true
            tempMesh.castShadow = true;
            this.scene.add(tempMesh);
        }
    }


}
