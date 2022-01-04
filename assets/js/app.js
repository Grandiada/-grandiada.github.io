/******/ (function() { // webpackBootstrap
var __webpack_exports__ = {};
window.addEventListener('load', function () {
  var date = new Date(Date.now() + 96400e5).toUTCString();
  var VideoContainer = document.querySelector('.video');
  var MainVideo = document.querySelector('.video__item');
  var GetLink = document.querySelectorAll('.home-btn .btn.lock');
  var VideoHover = document.querySelector('.home__hover');
  var Preloader = document.querySelector('.preloader');
  var PreloaderAnswer = document.querySelector('.preloader__answer');
  var Play = document.querySelector('#play');
  var Width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  var Height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
  var VideoSkip = document.querySelector('.video__skip');
  var Subscribe = document.querySelector('#subscribe');
  var Glitch = document.querySelector('#glitch');
  var body = document.querySelector('body');
  var home = document.querySelector('.home');
  var canvas = document.querySelector('canvas');
  var intervalId = 0;
  VideoHover.play(); // Прогресс бар

  setTimeout(function () {
    Play.disabled = false;
    Play.classList.add('show');
  }, 3000);
  var ratioArray = [{
    ratio: '19.5:9',
    floatRatio: 2.16,
    width: 2778,
    height: 1284,
    videoSrc: '../assets/video/2778x1284.h264-muxed.mp4'
  }, {
    ratio: '9:19.5',
    floatRatio: 0.46,
    width: 1284,
    height: 2778,
    videoSrc: '../assets/video/1284x2778.h264-muxed.mp4'
  }, {
    ratio: '4:3',
    floatRatio: 1.33,
    width: 2732,
    height: 2048,
    videoSrc: '../assets/video/2732x2048.h264-muxed.mp4'
  }, {
    ratio: '3:4',
    floatRatio: 0.75,
    width: 2048,
    height: 2732,
    videoSrc: '../assets/video/2048x2732.h264-muxed.mp4'
  }, {
    ratio: '16:9',
    floatRatio: 1.77,
    width: 1920,
    height: 1080,
    videoSrc: '../assets/video/1920x1080.h264-muxed.mp4'
  }, {
    ratio: '9:16',
    floatRatio: 0.56,
    width: 1080,
    height: 1920,
    videoSrc: '../assets/video/1080x1920.h264-muxed.mp4'
  }, {
    ratio: '16:10',
    floatRatio: 1.6,
    width: 2880,
    height: 1800,
    videoSrc: '../assets/video/2880x1800.h264-muxed.mp4'
  }];

  function closest(num, arr) {
    var curr = arr[0];
    var diff = Math.abs(num - curr);

    for (var val = 0; val < arr.length; val++) {
      var newdiff = Math.abs(num - arr[val]);

      if (newdiff < diff) {
        diff = newdiff;
        curr = arr[val];
      }
    }

    return curr;
  }

  var currentRatioFloat = Width / Height;
  var matchedRatioFloat = parseFloat(closest(currentRatioFloat, ratioArray.map(function (i) {
    return i.floatRatio;
  })));
  var config = ratioArray.find(function (i) {
    return i.floatRatio === matchedRatioFloat;
  });
  MainVideo.src = config.videoSrc;
  canvas.width = config.width;
  canvas.height = config.height;
  MainVideo.load(); // Скип видео

  function Skip() {
    clearInterval(intervalId);
    MainVideo.pause();
    VideoContainer.remove();

    if (Width < 1024) {
      body.style.overflow = 'auto';
      body.style.height = 'auto';
      home.style.height = 'auto';
      window.scrollBy(0, 0);
    }
  }

  VideoSkip.addEventListener('click', function () {
    Skip();
  });
  MainVideo.addEventListener('ended', function () {
    Skip();
  });

  window.playClick = function () {
    if (get_cookie('visited')) {
      VideoSkip.classList.add('show');
    }

    document.cookie = 'visited=true; expires=' + date;

    function initBuffers(gl) {
      var positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      var positions = [// Front face
      -1.0, -1.0, 0.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0.0, -1.0, 1.0, 0.0, 0.0, -1.0, -1.0, 0.0, 1.0];
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
      return {
        position: positionBuffer
      };
    }

    function initTexture(gl) {
      var texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      var level = 0;
      var internalFormat = gl.RGBA;
      var width = 1;
      var height = 1;
      var border = 0;
      var srcFormat = gl.RGBA;
      var srcType = gl.UNSIGNED_BYTE;
      var pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue

      gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      return texture;
    }

    function updateTexture(gl, texture, video) {
      var level = 0;
      var internalFormat = gl.RGBA;
      var srcFormat = gl.RGBA;
      var srcType = gl.UNSIGNED_BYTE;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, video);
    }

    function initBasis(gl, programInfo, buffers, texture) {
      gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque

      gl.clearDepth(1.0); // Clear everything

      gl.enable(gl.DEPTH_TEST); // Enable depth testing

      gl.depthFunc(gl.LEQUAL); // Near things obscure far things

      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
      gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 4, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
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
      var vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
      var fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
      var shaderProgram = gl.createProgram();
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
      var shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }

      return shader;
    }

    var gl = canvas.getContext('experimental-webgl');

    if (!gl) {
      canvas.setAttribute("style", "display:none");
    } else {
      MainVideo.setAttribute("style", "display:none");
      var vsSource = "\n        attribute vec4 aVertexPosition;\n        varying highp vec2 vTextureCoord;\n        void main(void) {\n          gl_Position = vec4(aVertexPosition.xy, 0.0, 1.0);\n          vTextureCoord = aVertexPosition.zw;\n        }\n      ";
      var fsSource = "\n        varying highp vec2 vTextureCoord;\n        uniform sampler2D uSampler;\n        void main(void) {\n          gl_FragColor = texture2D(uSampler, vTextureCoord);\n        }\n      ";
      var shaderProgram = initShaderProgram(gl, vsSource, fsSource);
      var programInfo = {
        program: shaderProgram,
        attribLocations: {
          vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition')
        },
        uniformLocations: {
          uSampler: gl.getUniformLocation(shaderProgram, 'uSampler')
        }
      };
      var buffers = initBuffers(gl);
      var texture = initTexture(gl);
      initBasis(gl, programInfo, buffers, texture);
      intervalId = setInterval(function () {
        updateTexture(gl, texture, MainVideo);
        drawScene(gl);
      }, 16);
    }

    Glitch.classList.add('show');
    Glitch.play();
    Glitch.addEventListener('ended', function () {
      Glitch.classList.remove('show');
    });
    MainVideo.play();
    Preloader.remove();
  }; // window.playClick = function () {
  //   if (get_cookie('visited')) {
  //     VideoSkip.classList.add('show');
  //   }
  //   document.cookie = 'visited=true; expires=' + date;
  //   Preloader.classList.add('hide');
  //   Play.classList.add('hide');
  //
  //   const audio = new Audio();
  //   audio.autoplay = true;
  //   audio.src = 'data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
  //
  //   setTimeout(() => {
  //     const canvas = document.getElementById('canvas');
  //     let srcVideo = '';
  //     canvas.style.width = '100%';
  //     canvas.style.height = '100%';
  //
  //     if (Width > 1600) {
  //       srcVideo = '../assets/video/1920_track.mp4';
  //       canvas.width = 1920;
  //       canvas.height = 1080;
  //     } else if (Width <= 1600 && Width >= 1200) {
  //       srcVideo = '../assets/video/1440_track.mp4';
  //       canvas.width = 1440;
  //       canvas.height = 900;
  //     } else if (Width <= 1200 && Width >= 1024) {
  //       srcVideo = '../assets/video/1024_track.mp4';
  //       canvas.width = 1024;
  //       canvas.height = 1366;
  //     } else {
  //       srcVideo = '../assets/video/1284_track.mp4';
  //       canvas.width = 1284;
  //       canvas.height = 2778;
  //     }
  //
  //     const videoCtx = new VideoContext(canvas);
  //     const videoNode = videoCtx.video(srcVideo, 0, 2, {
  //       volume: 0
  //     });
  //     // videoNode.volume(0);
  //     // const audioNode = videoCtx.audio('../assets/video/audio.mp3');
  //     // audioNode.connect(videoCtx.destination);
  //     // audioNode.start(0);
  //     videoNode.connect(videoCtx.destination);
  //     videoNode.start(0);
  //
  //     //audio context
  //     // const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  //
  //     // const source= audioCtx.createMediaElementSource(audio);
  //     // source.connect(audioCtx.destination);
  //     // audio.play();
  //     videoCtx.play();
  //     // VideoAudio.play()
  //     videoCtx.registerCallback(VideoContext.EVENTS.CONTENT, () => {
  //       audio.src = './assets/video/audio.mp3';
  //     });
  //
  //     videoCtx.registerCallback(VideoContext.EVENTS.ENDED, () => {
  //       VideoContainer.remove();
  //       audio.pause();
  //       if (Width < 1024) {
  //         body.style.overflow = 'auto';
  //         body.style.height = 'auto';
  //         home.style.height = 'auto';
  //         window.scrollBy(0, 0);
  //       }
  //     });
  //
  //     VideoSkip.addEventListener('click', () => {
  //       videoCtx.pause();
  //       audio.pause();
  //       canvas.remove();
  //       VideoContainer.remove();
  //       if (Width < 1024) {
  //         body.style.overflow = 'auto';
  //         body.style.height = 'auto';
  //         home.style.height = 'auto';
  //         window.scrollBy(0, 0);
  //       }
  //     });
  //   }, 1500);
  // };
  // Чистка hover видео


  VideoHover.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    e.stopPropagation();
  }, false);

  if (VideoHover.hasAttribute('controls')) {
    VideoHover.removeAttribute('controls');
  } // Hover видео


  GetLink.forEach(function (item) {
    item.addEventListener('click', function (e) {
      e.preventDefault();
    });

    var startHover = function startHover() {
      item.textContent = 'coming soon';
      item.classList.add('white');
      VideoHover.currentTime = 0;
      VideoHover.play();
      VideoHover.classList.add('play');
      VideoHover.addEventListener('ended', function () {
        VideoHover.currentTime = 0;
        VideoHover.play();
      });
    };

    var removeHover = function removeHover() {
      item.textContent = 'get started';
      item.classList.remove('white');
      VideoHover.classList.remove('play');
      VideoHover.pause();
    };

    if (Width > 1023.98) {
      item.addEventListener('mouseover', function () {
        startHover();
      });
      item.addEventListener('mouseout', function () {
        removeHover();
      });
    } else {
      item.addEventListener('click', function (e) {
        startHover();
        setTimeout(function () {
          removeHover();
        }, 3000);
      });
    }
  }); // Модальное окно

  var Modal = document.querySelector('.modal');
  var ModalClose = document.querySelector('.modal__close');
  Subscribe.addEventListener('click', function (e) {
    e.preventDefault();
    Modal.classList.add('show');
  });
  ModalClose.addEventListener('click', function () {
    Modal.classList.remove('show');
  }); // cookie

  function get_cookie(cookie_name) {
    var results = document.cookie.match('(^|;) ?' + cookie_name + '=([^;]*)(;|$)');
    if (results) return unescape(results[2]);else return null;
  } // reality? yes/no toggle


  (function () {
    setInterval(function () {
      setTimeout(function () {
        PreloaderAnswer.innerHTML = 'No';
      }, 150);
      setTimeout(function () {
        PreloaderAnswer.innerHTML = 'Yes';
      }, 300);
    }, 300);
  })();
});
$(document).ready(function () {
  $('#form').submit(function () {
    $.ajax({
      type: 'POST',
      url: '../../form.php',
      data: $(this).serialize()
    }).done(function () {
      $(this).find('input').val('');
      $('.modal__title').html("The subscription has <br> been successfully activated");
      $('.modal__label').addClass('hide');
      $('#form').trigger('reset');
      setTimeout(function () {
        $('.modal__title').html("Join the ranks of <br> the PLANETA NOSTRA");
        $('.modal__label').removeClass('hide');
      }, 5000);
    });
    return false;
  });
});
/******/ })()
;