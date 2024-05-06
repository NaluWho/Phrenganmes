class FormUtil {
    constructor(config) {
        //super();
        this.scene = config.scene;
        //get the game height and width
        this.gameWidth = this.scene.add.systems.canvas.width;
        this.gameHeight = this.scene.add.systems.canvas.height;
        this.alignGrid = new AlignGrid({
            scene: this.scene,
            rows: config.rows,
            cols: config.cols
        });
    }

    showNumbers() {
        this.alignGrid.showNumbers();
    }

    scaleToGameW(elName, per) {
        var el = document.getElementById(elName);
        var w = this.gameWidth * per;
        el.style.width = w + "px";
    }

    scaleToGameH(elName, per) {
        var el = document.getElementById(elName);
        var h = this.gameHeight * per;
        el.style.height = h + "px";
    }

    placeElementByPosAt(x, y, elName) {
        //get the element
        var el = document.getElementById(elName);
        
        el.style.position = "absolute";
        el.style.margin = "auto";
        el.style.transform = "translate(-50%, -50%)";
        el.style.left = x + "px";
        el.style.top = y + "px";
        el.style.textAlign = "center";
    }

    placeElementByIndexAt(index, elName, centerX = true, centerY = false) {
        //get the position from the grid
        var pos = this.alignGrid.getPosByIndex(index);

        var x = pos.x;
        var y = pos.y;

        //get the element
        var el = document.getElementById(elName);
        
        el.style.position = "absolute";
        var w = el.style.width;
        var h = el.style.height;
        //convert to a number
        w = this.toNum(w);
        h = this.toNum(h);
        
        //center horizontally and vertically in square if needed
        if (centerX == true) {
            x -= w / 2;
        }
        if (centerY == true) {
            y -= h / 2;
        }

        //set the positions
        el.style.top = y + "px";
        el.style.left = x + "px";
    }

    //changes 100px to 100
    toNum(s) {
        s = s.replace("px", "");
        s = parseInt(s);
        return s;
    }

    //add a change callback
    addChangeCallback(elName, fun, scope = null) {
        var el = document.getElementById(elName);
        if (scope == null) {
            el.onchange = fun;
        } else {
            el.onchange = fun.bind(scope);
        }
    }

    getTextAreaValue(elName) {
        var el = document.getElementById(elName);
        return el.value;
    }

    getTextValue(elName) {
        var el = document.getElementById(elName);
        return el.innerText;
    }

    hideElement(elName) {
        var el = document.getElementById(elName);
        el.style.display = "none";
    }

    showElement(elName) {
        var el = document.getElementById(elName);
        el.style.display = "block";
    }
}