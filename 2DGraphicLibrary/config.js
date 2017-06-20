(function(){

    moss.get("scene").set({
        sprite: "images/background.png",
        size: { width: "1024px", height: "600px" }
    });

    moss.get("floor").set({
        sprite: "images/floor.png",
        size: { width: "1024px", height: "152px" },
        pos: { x: 0, y: 0.75 },
        collider: { x: 0, y: 0.35, width: 1, height: 0.65}
    });

    moss.get("platform").set({
        sprite: "images/platform.png",
        size: { width: "340px", height: "78px" },
        pos: { x: 0.10, y: 0.22 },
        collider: { x: 0, y: 0.25, width: 1, height: 0.55}
    });

    moss.get("character").set({
        spritesheet: "images/character/character_sheet.png",
        size: { width: "90px", height: "170px" },
        pos: { x: 0.45, y: 0.18 },
        movable: true,
        gravity: true,
        jump: true
    });

    moss.get("floor-front").set({
        sprite: "images/floor_front.png",
        size: { width: "1024px", height: "152px" },
        pos: { x: 0, y: 0.75 }
    });

    moss.get("barricade").set({
        sprite: "images/barricade.png",
        size: { width: "95px", height: "208px" },
        pos: { x: 0.8, y: 0.55 },
        collider: { x: 0.3, y: 0.1, width: 0.3, height: 0.9 }
    });

    moss.get("sun").set({
        sprite: "images/sun.png",
        size: { width: "128px", height: "128px" },
        pos: { x: 0, y: 0.04 }
    });

})();
