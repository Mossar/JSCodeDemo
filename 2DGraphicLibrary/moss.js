/* mossJS - Javascript framework for 2D graphics */

window.moss = (function(){

    var frames = 0, fps = [], timeStart = 0, timeNow = 0;

    var TIME_INTERVAL = 16;
    var isPlaying = true;
    var loadFunc = null, updateFunc = null;
    var keyFunc = {};
    var objects = [], gravityObjects = [], colliders = [];
    var particleIndex = 0, particles = [];
    var animationIndex = 0, animations = {};
    var movableObj = {};
    var scene = {
        element: null, width: 0, height: 0
    };
    var svg = null;
    var keyPressed = {}, keyListeners = [];
    var standardSpeed = 18, standardJumpSpeed = 50, standardGravity = 12;

    document.onkeydown = function(e){
        keyPressed[e.keyCode] = true;
    };
    document.onkeyup = function(e){
        keyPressed[e.keyCode] = false;
    };

    function Element(element, name){
        this.element = element;
        this.name = name;
        this.rotation = 0;
        this.scaleFactor = {
            x: 1, y: 1
        };
        return this;
    }

    /* Functions which sets attributes of objects */
    Element.prototype.set = function(config){
        var style = this.element.style;
        for(var attr in config){
            switch(attr){
                case "shape":
                if(config[attr].type == "circle") style.borderRadius = "100%";
                style.background = config[attr].color;
                break;
                case "sprite":
                style.background = "url(" + config[attr] +") no-repeat";
                style.backgroundSize = "100% 100%";
                break;
                case "spritesheet":
                style.background = "url(" + config[attr] +") no-repeat";
                style.backgroundSize = "auto 100%";
                this.animations = [];
                break;
                case "size":
                var size = config[attr];
                style.width = size.width; style.height = size.height;
                this._setSize(size.width, size.height);
                break;
                case "pos":
                var pos = config[attr];
                this.setPos(pos.x, pos.y);
                break;
                case "origin":
                origin = config[attr];
                this.origin = {
                    x: isNaN(origin.x) ? origin.x : _percent(origin.x),
                    y: isNaN(origin.y) ? origin.y : _percent(origin.y)
                };
                style.transformOrigin = this.origin.x + " " + this.origin.y;
                break;
                case "curve":
                if(!svg) {
                    svg = _createSVG();
                    scene.element.appendChild(svg);
                }
                this.curve = document.createElementNS("http://www.w3.org/2000/svg", 'path');
                this.setCurve(config[attr]);
                svg.appendChild(this.curve);
                break;
                case "movable":
                if(config[attr]) movableObj = this;
                keyFunc.left = movableObj.moveHorizontally.bind(movableObj, -standardSpeed/scene.width);
                keyFunc.right = movableObj.moveHorizontally.bind(movableObj, standardSpeed/scene.width);
                keyFunc.top = movableObj.moveVertically.bind(movableObj, -standardSpeed/scene.height);
                keyFunc.bottom = movableObj.moveVertically.bind(movableObj, standardSpeed/scene.height);
                break;
                case "gravity":
                this.gravity = parseFloat(config[attr])/scene.height || standardGravity/scene.height;
                gravityObjects.push(this);
                break;
                case "collider":
                var collider = config[attr];
                if(collider) this._setCollider({ x: collider.x, y: collider.y, z: collider.width, w: collider.height  });
                else this._setCollider({ x:0, y:0, w:1, z:1 });
                colliders.push(this);
                break;
                case "jump":
                movableObj = this;
                this.nowJumping = false;
                keyFunc.top = movableObj.startJumping.bind(movableObj);
                break;
                case "particle":
                this.particle = config[attr];
                particles.push(this);
                this.setParticles_topLeft();
                break;
            }
        }

        this._setFixedCollider();

        if(this.name.toLowerCase() == "scene"){
            scene.width = this.width;
            scene.height = this.height;
        }

        if(!this.origin) this.element.style.transformOrigin = "50% 50%";

    };
    Element.prototype._setPos = function(x, y){
        this.x = x;
        this.y = y;
    };
    Element.prototype._setSize = function(width, height){
        this.width = parseInt(width.slice(0,-2));
        this.height = parseInt(height.slice(0,-2));
    };
    Element.prototype._setCollider = function(collider){
        this.collider = {
            x: collider.x,
            y: collider.y,
            width: collider.z,
            height: collider.w
        };
    };
    Element.prototype._setFixedCollider = function(){
        if(!this.collider){ this.collider = { x: 0, y: 0, width: 1, height: 1 } }
        this.fixedCollider = {
            x: this.collider.x * this.width / scene.width + this.x,
            y: this.collider.y * this.height / scene.height + this.y,
            xEnd: null,
            yEnd: null
        };
        this.fixedCollider.xEnd = this.fixedCollider.x + this.collider.width * this.width / scene.width;
        this.fixedCollider.yEnd = this.fixedCollider.y + this.collider.height * this.height / scene.height;
    };

    /* Setters */
    Element.prototype.setPos = function(x, y){
        this._setPos(x, y);
        var style = this.element.style;
        style.top = isNaN(y) ? y : _percent(y);
        style.left = isNaN(x) ? x : _percent(x);
    }
    Element.prototype.setScale = function(x, y){
        this.scaleFactor.x = x;
        this.scaleFactor.y = y;
        this.transform();
    }
    Element.prototype.setRotation = function(rotation){
        this.rotation = 0;
        this.transform();
    }
    Element.prototype.setCurve = function(curveOptions){
        var path = "M";
        for(var i = 0; i < curveOptions.path.length; i++) {
            var point = curveOptions.path[i];
            if(i == 0) path += point.x + " " + point.y + " Q "
            else if(i < curveOptions.path.length - 1) path += point.x + " " + point.y + " ";
            else {
                if(curveOptions.path.length > 3) path += " T " + point.x + " " + point.y;
                else path += point.x + " " + point.y;
            }
        }
        this.curve.setAttribute("d", path);
        this.curve.style.fill = curveOptions.fill || "transparent";
        this.curve.style.stroke = curveOptions.color || "#000";
        this.curve.style.strokeWidth = curveOptions.width || "1px";
    }
    Element.prototype.setOrigin = function(x, y){
        this.origin = {
            x: isNaN(x) ? x : _percent(x),
            y: isNaN(y) ? y : _percent(y)
        };
    }
    Element.prototype.setParticle = function(particle){
        for (var property in particle) {
            if (particle.hasOwnProperty(property)) {
                this.particle[property] = particle[property];
            }
        }
        this.setParticles_topLeft();
    }

    /* Getters */
    Element.prototype.getPos = function(){
        return {
            x: this.x,
            y: this.y
        }
    }
    Element.prototype.getScale = function(x, y){
        return this.scaleFactor;
    }
    Element.prototype.getRotation = function(){
        return this.rotation;
    }

    /* Default functions for movement */
    Element.prototype.moveHorizontally = function(speed){
        var isCollision = false;
        this.x += speed;
        this.fixedCollider.x += speed;
        this.fixedCollider.xEnd += speed;
        if(this.collider) isCollision = this.checkCollisions();

        if(isCollision){
            this.x -= speed;
            this.fixedCollider.x -= speed;
            this.fixedCollider.xEnd -= speed;
        } else {
            this.element.style.left =  _percent(this.x);
        }
    };
    Element.prototype.moveVertically = function(speed){
        var isCollision = false;
        this.y += speed;
        this.fixedCollider.y += speed;
        this.fixedCollider.yEnd += speed;
        if(this.collider) isCollision = this.checkCollisions();

        if(isCollision){
            this.y -= speed;
            this.fixedCollider.y -= speed;
            this.fixedCollider.yEnd -= speed;
            this.activeJumpSpeed = 0;
            if(speed > 0){
                this.nowJumping = false;
            }
        } else {
            this.element.style.top =  _percent(this.y);
        }
    };
    Element.prototype.startJumping = function(){
        if(this.nowJumping) return;
        else {
            this.activeJumpSpeed = standardJumpSpeed/scene.height;
            this.nowJumping = true;
        }
    }
    Element.prototype.jump = function(){
        if(this.activeJumpSpeed > 0){
            this.moveVertically(-this.activeJumpSpeed);
            this.activeJumpSpeed -= 3/scene.height;
        }
    }

    /* Functions connected with collision detection */
    Element.prototype.checkCollisions = function() {
        var isCollision;
        var currentCollider = this.fixedCollider;
        for(var i = 0, length = colliders.length; i < length; i++){
            if(colliders[i].name == this.name) continue;
            var objCollider = colliders[i].fixedCollider;
            isCollision = true;
            var thisR = { x: (currentCollider.xEnd - currentCollider.x)/2, y: (currentCollider.yEnd - currentCollider.y)/2 };
            var objR = { x: (objCollider.xEnd - objCollider.x)/2, y: (objCollider.yEnd - objCollider.y)/2 };
            if ( Math.abs(currentCollider.x + thisR.x - (objCollider.x + objR.x)) > thisR.x + objR.x )
            isCollision = false;
            if ( Math.abs(currentCollider.y + thisR.y - (objCollider.y + objR.y)) > thisR.y + objR.y )
            isCollision = false;
            if(isCollision){
                if(this.onCollisionFunc) this.onCollisionFunc(colliders[i]);
                return true;
            }
        }
        return false;
    };
    Element.prototype.getBoundingBox = function(){
        if(this.fixedCollider) return this.fixedCollider;
    }
    Element.prototype.onCollision = function(callback){
        Element.prototype.onCollisionFunc = callback;
    }

    /* Functions connected with animations */
    Element.prototype.addAnimation = function(name, start, amount, time){
        this.animations.push({
            obj: this,
            name: name,
            start: start,
            amount: amount,
            time: time || 25
        });
        return this;
    }
    Element.prototype.runAnimation = function(name){
        for(var i = 0, len = this.animations.length; i < len; i++){
            if(this.animations[i].name == name){
                animations[this.name] = this.animations[i];
            }
        }

        return this;
    }

    /* Functions which modify geometry of object */
    Element.prototype.translate = function(x, y){
        var el = this.element.style;
        this.x += x;
        this.y += y;
        el.left = _percent(this.x); el.top = _percent(this.y);
        if(this.collider){
            this._setFixedCollider();
            this.checkCollisions();
        }
        return this;
    }
    Element.prototype.rotate = function(degree){
        this.rotation += degree;
        if(this.rotation >= 360) this.rotation %= 360;
        this.transform();
        return this;
    }
    Element.prototype.scale = function(scaleX, scaleY){
        this.scaleFactor.x *= scaleX;
        this.scaleFactor.y *= scaleY;
        this.transform();
        return this;
    }
    Element.prototype.flip = function(axis, isFlipped) {
        if(isFlipped) {
            if(axis.toUpperCase() == "X") this.element.style.transform = "rotateY(180deg)";
            if(axis.toUpperCase() == "Y") this.element.style.transform = "rotateX(180deg)";
        }
        else {
            if(axis.toUpperCase() == "X") this.element.style.transform = "rotateY(0deg)";
            if(axis.toUpperCase() == "Y") this.element.style.transform = "rotateX(0deg)";
        }
        return this;
    }
    Element.prototype.transform = function() {
        var el = this.element.style;
        el.transform = "rotate(" + this.rotation + "deg) scale(" + this.scaleFactor.x + "," + this.scaleFactor.y + ")";
    }

    /* Particles functions */
    Element.prototype.setParticles_animation = function(){
        this.particles = [];
        if(!this.particle.run) this.element.style.opacity = 0;
        var styleElement = document.createElement("style");
        styleElement.appendChild(document.createTextNode(""));
        document.head.appendChild(styleElement);
        var sheet = styleElement.sheet;
        for(var i = 0; i < this.particle.amount; i++){
            var element = document.createElement("div");
            element.id = this.name + "_" + i;
            element.style.background = "url(" + this.particle.sprite +") no-repeat";
            element.style.backgroundSize = "100% 100%";
            element.style.width = this.particle.width;
            element.style.height = this.particle.height;
            element.style.position = "absolute";
            element.style.top = 0;
            element.style.left = 0;

            var name = this.name + "_" + i;
            _addParticleAnimation(sheet, this.particle, name);
            element.style.animation =  name + " " + this.particle.lifeTime/1000 + "s linear " + i / this.particle.amount + "s infinite";
            this.element.appendChild(element);
        }
    }
    function _addParticleAnimation(sheet, particle, name){
        var animation = "@keyframes " + name + "{";
        var step = 5;
        var top = 0;
        var left = 0;
        var offsetX = particle.speed * TIME_INTERVAL / 1000 * particle.direction.x * step;
        var offsetY = particle.speed * TIME_INTERVAL / 1000 * particle.direction.y * step;

        var distance = particle.lifeTime * particle.speed / 1000;
        for(var i = 0; i <= distance; i = i + step){
            var randomX = Math.random() * 2 - 1, randomY = Math.random() * 2 - 1;
            top += offsetY * (1 + randomY * particle.verticalRandom);
            left += offsetX * (1 + randomX *  particle.horizontalRandom);
            animation +=  i/distance * 100 + "% { top:" + top + "px; left: " + left + "px; }";
        }
        animation += "}";
        sheet.insertRule(animation, 0);
    }
    Element.prototype.setParticles_topLeft = function(){
        this.particles = [];
        if(!this.particle.run) this.element.style.opacity = 0;
        this.element.innerHTML = "";
        for(var i = 0; i < this.particle.amount; i++){
            var element = document.createElement("div");
            element.id = this.name + "_" + i;
            element.style.background = "url(" + this.particle.sprite +") no-repeat";
            element.style.backgroundSize = "100% 100%";
            element.style.width = this.particle.width;
            element.style.height = this.particle.height;
            element.style.position = "absolute";
            element.style.top = 0;
            element.style.left = 0;
            this.element.appendChild(element);
            var distance = this.particle.lifeTime * this.particle.speed / 1000;
            var particle = {
                element: element,
                top: i/this.particle.amount * distance * this.particle.direction.y,
                left: i/this.particle.amount * distance * this.particle.direction.x,
                lifeLeft: this.particle.lifeInterval - i/this.particle.amount * this.particle.lifeInterval,
                offsetX: this.particle.speed * TIME_INTERVAL / 1000 * this.particle.direction.x,
                offsetY: this.particle.speed * TIME_INTERVAL / 1000 * this.particle.direction.y,
                randomImpactX: this.particle.horizontalRandom,
                randomImpactY: this.particle.verticalRandom,
                lifeTime: this.particle.lifeTime,
                lifeInterval: this.particle.lifeInterval,
                run: this.particle.run
            };
            this.particles.push(particle);
        }
    }
    Element.prototype.runParticle = function(){
        this.particle.run = true;
        this.element.style.opacity = 1;
    }
    Element.prototype.stopParticle = function(){
        this.particle.run = false;
        this.element.style.opacity = 0;
    }

    var moss = {

        /* Starts game after defining init and update functions. */
        start: function(){
            if(typeof(loadFunc) == "function") loadFunc();

            (function loop(){
                if(isPlaying) setTimeout(loop, TIME_INTERVAL);

                _setFPS();
                if(typeof(updateFunc) == "function") updateFunc();

                _getKeyEvents();
                if(movableObj.nowJumping) movableObj.jump();
                _handleGravityObjects();
                _animateObjects();
                _runParticles_topLeft();

                frames++;
                timeNow = performance.now();
            })();

            return this;
        },

        /* Returns function which should load proper things on app start. */
        init: function(callback){
            loadFunc = callback;
            return this;
        },

        /* Returns function which should be executed in a loop. */
        update: function(callback){
            updateFunc = callback;
            return this;
        },

        /* Stops loop. */
        stop: function(){
            isPlaying = false;
            return this;
        },

        /* Get element by name */
        get: function(name){
            for(var i = 0; i < objects.length; i++){
                if(objects[i].name == name.toUpperCase()) return objects[i];
            }
        },

        /* Create an element */
        create: function(name){
            var element = document.createElement(name);
            scene.element.appendChild(element);
            objects[objects.length] = new Element( element, element.tagName );
            _setBasics(objects[objects.length-1]);
            return this.get(name);
        },

        /* Add button listener */
        onPressed: function(buttons, callback){
            if(typeof(buttons) == "string") buttons = [buttons];
            for(var i = 0; i < buttons.length; i++){
                var listener = {
                    button: buttons[i],
                    func: callback
                };
                keyListeners.push(listener);
            }
        },

        getFPS: function() {
            return fps;
        }

    };

    function _fetch(){
        var elements = document.body.getElementsByTagName("*");
        for(var i = 0; i < elements.length; i++){
            if(elements[i].tagName != "SCRIPT"){
                objects[objects.length] = new Element( elements[i], elements[i].tagName );
                _setBasics(objects[objects.length-1]);
            }
            if(i == 0) _setLoading();
        }
    }
    function _setBasics(obj){
        var element = obj.element;
        var style = element.style;
        style.top = style.left = 0;
        style.display = "inline-block";

        if(obj.name.toLowerCase() == "scene"){
            style.position = "relative";
            style.overflow = "hidden";
            scene.element = element;
            scene.width = obj.width;
            scene.height = obj.height;
        }
        else style.position = "absolute";
    }
    function _createSVG(){
        var svgElem = document.createElementNS("http:\/\/www.w3.org/2000/svg", "svg");
        svgElem.style.display = "block";
        svgElem.setAttributeNS (null, "width", scene.width);
        svgElem.setAttributeNS (null, "height", scene.height);
        return svgElem;
    }
    function _setLoading(){
        var node = document.createElement("div");
        node.id = "loading";
        node.style.width = node.style.height = "100%";
        node.style.background = "black";
        node.style.opacity = 1;
        scene.element.appendChild(node);
    }
    function _hideLoading(){
        var loading = document.getElementById("loading");
        var style = loading.style;
        (function fadeOut(){
            style.opacity -= 0.01;
            if(style.opacity == 0) scene.element.removeChild(loading);
            else setTimeout(fadeOut, 10);
        })();
    }
    function _addFPS(){
        var fpsCounter = document.createElement("div");
        fpsCounter.id = "fps";
        var style = fpsCounter.style;
        style.position = "fixed";
        style.top = "15px";
        style.right = "25px";
        style.color = "white";
        style.fontSize = "20px";
        fpsCounter.innerHTML = "0";
        document.body.appendChild(fpsCounter);
    }
    function _setFPS(){
        if(timeNow - timeStart >= 1000){
            timeStart = timeNow = performance.now();
            fps.push(frames);
            document.getElementById("fps").innerHTML = frames;
            frames = 0;
        }
    }
    function _percent(val){
        return val * 100 + "%";
    }
    function _retrieveXY(val){
        var splitted = val.split(",");
        return { x: splitted[0], y: splitted[1] }
    }
    function _retrieveXYZW(val){
        var splitted = val.split(",");
        return { x: splitted[0], y: splitted[1], z: splitted[2], w: splitted[3] }
    }
    function _getKeyEvents(){
        if(keyPressed[65] || keyPressed[37]){ keyFunc.left(); }
        else if(keyPressed[68] || keyPressed[39]){ keyFunc.right(); }

        if(keyPressed[87] || keyPressed[38] || keyPressed[" "]){ keyFunc.top(); }
        else if(keyPressed[83] || keyPressed[40]){ keyFunc.bottom(); }

        for(var i = 0, len = keyListeners.length; i < len; i++ ){
            if(keyPressed[keyListeners[i].button]) keyListeners[i].func();
        }
    }
    function _handleGravityObjects(){
        for(var i = 0; i < gravityObjects.length; i++){
            var obj = gravityObjects[i];
            obj.moveVertically(obj.gravity);
        }
    }
    function _animateObjects(){
        for(var animation in animations){
            var obj = animations[animation].obj;
            var range = animations[animation].amount - animations[animation].start;
            var order = parseInt(animationIndex * TIME_INTERVAL/animations[animation].time) % range;
            obj.element.style.backgroundPosition = -(order + animations[animation].start) * obj.width + "px 0px";
        }
        animationIndex++;
    }


    function _runParticles_animation(){

    }
    function _runParticles_topLeft(){
        for(var i = 0, length = particles.length; i < length; i++){
            var element = particles[i];
            if(!element.particle.run) continue;
            var elementParticles = element.particles;
            for(var j = 0, pLength = elementParticles.length; j < pLength; j++){
                var particle = elementParticles[j];
                _changeParticle(particle);
                if(particle.lifeLeft < 0) _resetParticle(particle);
            }
        }
    }
    function _changeParticle(particle){
        var style = particle.element.style;
        var randomX = Math.random() * 2 - 1, randomY = Math.random() * 2 - 1;
        particle.top += particle.offsetY + randomY * particle.randomImpactY;
        particle.left += particle.offsetX + randomX * particle.randomImpactX;
        particle.lifeLeft -= TIME_INTERVAL;
        style.top = particle.top + "px";
        style.left = particle.left + "px";
    }
    function _resetParticle(particle){
        particle.top = 0;
        particle.left = 0;
        particle.lifeLeft = particle.lifeTime;
    }
    

    _fetch();
    _hideLoading();
    _addFPS();

    return moss;

})();
