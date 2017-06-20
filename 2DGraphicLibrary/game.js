(function(){

    /* Creating JS object for sun element */
    var sun = {
        element: moss.get("sun"),
        index: 0,
        direction: 1,
        /* Examplary animation with usage of transformations' functions from mossJS */
        animate: function(){
            this.index++;
            if(this.index > 90){
                this.direction *= -1;
                this.index = 0;
            }
            this.element.translate(this.direction * 0.01, 0).rotate(10);
        }
    };

    /* Adding animations to character element, based on character's spritesheet in config.js */
    moss.get("character").addAnimation("IDLE", 0, 4, 100).addAnimation("RUN", 4, 2, 100);

    /* Example  of keyboard event catching */
    moss.onPressed([68, 39], function(){
        moss.get("character").flip("X", false).runAnimation("RUN");
    });

    moss.onPressed([65, 37], function(){
        moss.get("character").flip("X", true).runAnimation("RUN");
    });

    /* Example of on collision event catching */
    moss.get("character").onCollision(function(collider){
      if(collider.name == "BARRICADE"){
        console.log("BLOCK!");
      }
    });

    /* Main game loop function */
    moss.update(function(){
        moss.get("character").runAnimation("IDLE");
        sun.animate();
    });

    moss.start();

})();
