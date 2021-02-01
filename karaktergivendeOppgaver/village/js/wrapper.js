/**
 * En wrapper-klasse brukt for å minimere kode brukt
 * for å tegne modeller med tekstur i de andre klassene
 */
function drawWithTexture(textureBuffer, modelTexture, positionBuffer,
                         normalBuffer, shaderProgram, lightSource,
                         gl, modelMatrix, modelViewMatrix, projectionMatrix, camera)
{

    let tempModelMatrix = new Matrix4(modelMatrix);

    // Bind texture coordinates in shader
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    let a_TextureCoord = gl.getAttribLocation(shaderProgram, "a_TextureCoord");
    gl.vertexAttribPointer(a_TextureCoord, textureBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_TextureCoord);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // Activate texture unit (0)
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, modelTexture);

    let samplerLoc = gl.getUniformLocation(shaderProgram, "uSampler");
    gl.uniform1i(samplerLoc, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // Bind position coordinates in shader
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    let a_Position = gl.getAttribLocation(shaderProgram, "a_Position");
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // Bind normal vector in shader
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    let a_Normal = gl.getAttribLocation(shaderProgram, 'a_Normal');
    if (a_Normal !== -1) {
        gl.vertexAttribPointer(a_Normal, normalBuffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Normal);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // Light position variables
    let u_lightPosition = gl.getUniformLocation(shaderProgram, 'u_lightPosition');
    let u_diffuseLightColor = gl.getUniformLocation(shaderProgram, 'u_diffuseLightColor');
    let u_ambientLightColor = gl.getUniformLocation(shaderProgram, 'u_ambientLightColor');
    let u_specularLightColor = gl.getUniformLocation(shaderProgram, 'u_specularLightColor');
    let u_cameraPosition = gl.getUniformLocation(shaderProgram, 'u_cameraPosition');
    let cameraPosition = [camera.camPosX, camera.camPosY, camera.camPosZ];

    // Insert values from lightPosition
    let lightPosition = [lightSource.u_lightPosition.x,
        lightSource.u_lightPosition.y,
        lightSource.u_lightPosition.z];

    // Send values to shader
    gl.uniform3fv(u_lightPosition, lightPosition);
    gl.uniform3fv(u_diffuseLightColor, lightSource.u_diffuseLightColor);
    gl.uniform3fv(u_ambientLightColor, lightSource.u_ambientLightColor);
    gl.uniform3fv(u_specularLightColor, lightSource.u_specularLightColor);
    gl.uniform3fv(u_cameraPosition, cameraPosition);

    let u_normalMatrix = gl.getUniformLocation(shaderProgram, 'u_normalMatrix');
    let u_modelMatrix = gl.getUniformLocation(shaderProgram, 'u_modelMatrix');
    let u_modelviewMatrix = gl.getUniformLocation(shaderProgram, 'u_modelviewMatrix');
    let u_projectionMatrix = gl.getUniformLocation(shaderProgram, 'u_projectionMatrix');

    gl.uniformMatrix4fv(u_modelMatrix, false, tempModelMatrix.elements);
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelViewMatrix.elements);
    gl.uniformMatrix4fv(u_projectionMatrix, false, projectionMatrix.elements);

    let normalMatrix = mat3.create();
    mat3.normalFromMat4(normalMatrix, modelMatrix.elements);
    gl.uniformMatrix3fv(u_normalMatrix, false, normalMatrix);

    gl.drawArrays(gl.TRIANGLES, 0, positionBuffer.numberOfItems);
}

