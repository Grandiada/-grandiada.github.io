window.addEventListener('load', () => {
    const canvas = document.querySelector('canvas');
    const Width = window.innerWidth;
    const Height = window.innerHeight;
    const VideoStart = document.querySelector('.video__item');

    
  // Пути видео
  if (Width > 1600) {
    VideoStart.src = './assets/video/1920_track_convert.mp4';
    canvas.width = Width;
    canvas.height = canvas.width / 1920 * 1080;
  } else if (Width <= 1600 && Width >= 1200) {
    VideoStart.src = './assets/video/1440_track_convert.mp4';
    canvas.width = Width;
    canvas.height = canvas.width / 1440 * 900;
  } else if (Width <= 1200 && Width >= 1024) {
    VideoStart.src = './assets/video/1024_track_convert.mp4';
    canvas.width = Width;
    canvas.height = canvas.width / 1024 * 1366;
  } else {
    VideoStart.src = './assets/video/1284_track_convert.mp4';
    canvas.height = Height;
    canvas.width = canvas.height / 2778 * 1284;
  }

  
  window.playClick = function () {

    function initBuffers(gl) {
      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      const positions = [
        // Front face
        -1.0, -1.0, 0.0, 1.0,
        1.0, -1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 0.0,
        1.0, 1.0, 1.0, 0.0,
        -1.0, 1.0, 0.0, 0.0,
        -1.0, -1.0, 0.0, 1.0,
      ];
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

      return {
        position: positionBuffer,
      };
    }

    function initTexture(gl) {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);

      const level = 0;
      const internalFormat = gl.RGBA;
      const width = 1;
      const height = 1;
      const border = 0;
      const srcFormat = gl.RGBA;
      const srcType = gl.UNSIGNED_BYTE;
      const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
      gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
        width, height, border, srcFormat, srcType,
        pixel);

      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

      return texture;
    }

    function updateTexture(gl, texture, video) {
      const level = 0;
      const internalFormat = gl.RGBA;
      const srcFormat = gl.RGBA;
      const srcType = gl.UNSIGNED_BYTE;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
        srcFormat, srcType, video);
    }

    function initBasis(gl, programInfo, buffers, texture) {
      gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
      gl.clearDepth(1.0);                 // Clear everything
      gl.enable(gl.DEPTH_TEST);           // Enable depth testing
      gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
      gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        4,
        gl.FLOAT,
        false,
        0,
        0);
      gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

      gl.useProgram(programInfo.program);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(programInfo.uniformLocations.uSampler, 0);
    }

    function drawScene(gl) {
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    function initShaderProgram(gl, vsSource, fsSource) {
      const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
      const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

      const shaderProgram = gl.createProgram();
      gl.attachShader(shaderProgram, vertexShader);
      gl.attachShader(shaderProgram, fragmentShader);
      gl.linkProgram(shaderProgram);

      if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
      }

      return shaderProgram;
    }

    function loadShader(gl, type, source) {
      const shader = gl.createShader(type);

      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }

      return shader;
    }


    const gl = canvas.getContext('experimental-webgl');

    if (!gl) {
      canvas.setAttribute("style", "display:none");
    } else {
      VideoStart.setAttribute("style", "display:none");
      const vsSource = `
        attribute vec4 aVertexPosition;
        varying highp vec2 vTextureCoord;
        void main(void) {
          gl_Position = vec4(aVertexPosition.xy, 0.0, 1.0);
          vTextureCoord = aVertexPosition.zw;
        }
      `;

      const fsSource = `
        varying highp vec2 vTextureCoord;
        uniform sampler2D uSampler;
        void main(void) {
          gl_FragColor = texture2D(uSampler, vTextureCoord);
        }
      `;

      const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

      const programInfo = {
        program: shaderProgram,
        attribLocations: {
          vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        },
        uniformLocations: {
          uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
        }
      };

      const buffers = initBuffers(gl);

      const texture = initTexture(gl);

      initBasis(gl, programInfo, buffers, texture);

      intervalId = setInterval(() => {
        updateTexture(gl, texture, VideoStart);
        drawScene(gl);
      }, 16);
    }

    VideoStart.play();
  };

})