/** 
 * Development version 1.1.0
 * If you find a problem with this code or have some suggestions, please contact us by email. E-mail: 1625753207lim@gmail.com.
 */

const gmFactory = function (size) {

    let moves;
    let tiles, max = moves = 0, winScores = 2048, actions = [], histories = [];

    let events = { 'start': [], 'end': [], 'move': [] };

    let instance;
    instance = {
        init: function (initRow, maxScores) {

            tiles = new Array(initRow * initRow);
            size = initRow;
            for (let i = 0; i < tiles.length; i++) {
                tiles[i] = 0;
            }

            if (maxScores) winScores = maxScores;

            Object.defineProperty(this, "tiles", {
                get: function () {
                    return tiles;
                }
            });

            Object.defineProperty(this, "actions", {
                get: function () {
                    return actions;
                }
            });

            Object.defineProperty(this, "highestScore", {
                get: function () {
                    return max;
                }
            });

            Object.defineProperty(this, "moves", {
                get: function () {
                    return moves;
                }
            });

            Object.defineProperty(this, 'maxScores', {
                get: function () {
                    return winScores;
                }
            });

            for (i = 0; i < 6; i++) {
                this.randomVal();
            }
        }
        , randomVal: function () {
            let emptyTiles = [];
            for (let i = 0; i < tiles.length; i++) {
                if (tiles[i] == 0) emptyTiles.push(i);
            }

            if (emptyTiles.length < 1) {
                return false;
            }

            const pos = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
            tiles[pos] = Math.random() < 0.8 ? 2 : 4;

            actions.push({ 'type': 'create', 'index': pos, 'value': tiles[pos] });
        }, move: function (dir) {
            let rowStart, rowStep, nextStep;
            actions = [];
            if (dir === 'up') {
                rowStart = 0;
                rowStep = 1;
                nextStep = size;
            } else if (dir === 'left') {
                rowStart = 0;
                rowStep = size;
                nextStep = 1;
            } else if (dir === 'down') {
                rowStart = tiles.length - 1;
                rowStep = -1;
                nextStep = -size;
            } else if (dir === 'right') {
                rowStart = tiles.length - 1;
                rowStep = -size;
                nextStep = -1;
            }
            moves++;
            const end = tiles.length - 1 - rowStart;
            let megnet = rowStart;

            let his = [];
            for (let i = 0; i < tiles.length; i++) {
                his[i] = tiles[i];
            }
            histories.push(his);

            let currentRow = 0;
            while ((end != 0 && megnet < end) || (end == 0 && megnet > 0) && currentRow < size) {

                let floatTile = megnet;
                while (!this.isAtEdge(dir, megnet)) {

                    floatTile = floatTile + nextStep;
                    const floatTileValue = tiles[floatTile];
                    const megnetTileValue = tiles[megnet];

                    const swallowed = this.swallowUp(floatTile, megnet);
                    if (swallowed || (!swallowed && floatTileValue != 0 && megnetTileValue != 0)) {
                        megnet = megnet + nextStep;
                        floatTile = megnet;
                        continue;
                    }
                    if (this.isAtEdge(dir, floatTile)) {
                        megnet = floatTile;
                        break;
                    }
                }

                rowStart += rowStep;
                currentRow++;
                megnet = rowStart;
            }
            this.randomVal();
        }
        , isAtEdge: function (dir, tileIndex) {
            let leftMargin = 0, rightMargin = size - 1;
            const maxTopRowValue = size - 1, minBottomRowValue = tiles.length - size;
            switch (dir) {
                case 'down':
                    return tileIndex <= maxTopRowValue;
                case 'up':
                    return tileIndex >= minBottomRowValue;
                case 'left':
                    return tileIndex % size == rightMargin;
                case 'right':
                    return tileIndex % size == leftMargin;
            }
        }
        , swallowUp: function (floatTile, megnet) {
            const v1 = tiles[floatTile], v2 = tiles[megnet];

            if (v1 == 0) return false;

            if (v1 == v2 || v2 == 0) {
                const v = v1 + v2;
                tiles[megnet] = v;
                tiles[floatTile] = 0;

                actions.push({
                    'type': 'move', 'from': { 'index': floatTile, 'value': v1 }, 'to': { 'index': megnet, 'value': v }
                });

                max = Math.max(max, v);
                if (max == winScores) {
                    this.init(size);
                    this.fireEvent("end", this);
                }

                return v2 != 0;
            }

            return false;
        }, back: function () {
            if (histories.length < 1) return;
            tiles = histories.pop();
            this.render();
        }, setRenderer: function (renderer) {
            this.renderer = renderer;
            renderer.init(this);
        }, render: function () {
            this.renderer.render(this.tiles, actions);
        }, on: function (eventName, handler, scope) {
            if (!events[eventName]) return;
            let handlers = events[eventName];
            handlers.push({ 'fn': handler, 'scope': scope });
        }, un: function (eventName, handler, scope) {
            if (!events[eventName]) return;
            let handlers = events[eventName];
            if (handlers.length < 1) return;

            for (let i = 0; i < handlers.length; i++) {
                const h = handlers[i];
                if (h.fn == handler && h.scope == scope) {
                    handlers.splice(i, 1);
                    break;
                }
            }
        }
        , fireEvent: function () {
            const eventName = arguments[0];
            const args = arguments.slice(1);
            const handlers = events[eventName];
            if (!handlers || handlers.length < 1) return;
            for (let i = 0; i < handlers.length; i++) {
                let h = handlers[i];
                if (typeof h.fn == 'function') {
                    h.fn.apply(h.scope, args);
                }
            }
        }
    };

    instance.init(size);

    return instance;

};

let consoleRender = function () {
};

// 按键对应的数字
consoleRender.prototype.map = {
    //32 = space, 13 = enter
    87: 'up', //'w'
    83: 'down', //'s'
    65: 'left', //'a'
    68: 'right', //'d'
    37: 'left', //'←'
    38: 'up', //'↑'
    39: 'right', //'→'
    40: 'down', //'↓'
    90: 'z'
};

consoleRender.prototype.game = null;

consoleRender.prototype.colorPalette = function (keys) {
    const colors = ['#eee4da', '#ede0c8', '#f2b179', '#f59563', '#f67c5f', '#f65e3b', '#edcf72', '#edcc61', '#edc850', '#edc53f', '#edc22e'];
    let r = {};
    const _keys = keys.split(",");
    const length = _keys.length;
    for (let i = 0; i < length; i++) {
        r[_keys[i]] = 'background-color:' + colors[i] + ';';
    }
    return r;
};

// 添加空格调整数字打印位置
consoleRender.prototype.pad = function (str, length) {
    str = (str || ' ') + '';
    while (length > str.length) str = ' ' + str + ' ';
    if (str.length > length) str = str.slice(0, length - str.length);
    return str;
};

consoleRender.prototype.render = function (tiles, actions, notClear) {
    if (!notClear) console.clear();
    console.log(' ');
    const size = Math.sqrt(tiles.length); // 开方获取游戏面积大小: 4x4
    const colors = this.colorPalette("2,4,8,16,32,64,128,256,512,1024,2048"); // 为不同数字匹配相应颜色
    const baseStyle = 'text-align:center;width:100px;display:block;background-color:#ccc;padding:4px 7px;line-height:1.4;color:#000;';
    // 遍历游戏初始值
    for (let i = 0; i < size; i += 1) {
        let msg = [];
        let style = [];
        for (let j = 0; j < size; j++) {
            const v = tiles[size * i + j];
            msg.push('%c' + this.pad(v, 4) + '%c');
            style.push(baseStyle + 'font-size:14px;' + (colors[v] || ''));
            // msg.push('%c'+(v ? this.pad(v,4) : this.pad(i*size+j,4))+'%c');
            // style.push(baseStyle+';font-size:14px;'+(colors[v]||'color:#999;opacity:0.5'))
            style.push('');
        }
        msg.push('%c' + Math.random()); // 避免控制台将一样的msg组合显示
        style.push('padding-left:50px;dispaly:none;color:white;line-height:1.3'); // 随机数的样式
        // 将msg后面接上style来添加样式
        console.log.apply(console, [msg.join('')].concat(style));
    }
    // 创建、移动等指令的打印
    let msg = [];
    for (let i = 0; i < actions.length; i++) {
        const action = actions[i];
        if (action.type === 'move') {
            msg.push('#' + action.from.index + '->#' + action.to.index);
        } else {
            msg.push(action.value + ' created at #' + action.index)
        }
    }
    console.log('actions: ' + msg.join(' , ') + ' , ' + 'highestScore:' + this.game.highestScore);
};

// 键盘指令
consoleRender.prototype.keydownHandler = function (e) {
    let keynum, keychar;
    keynum = e.keyCode || e.which;
    // 第一次按下回车，开始游戏
    if (!this.started) {
        if (keynum === 13) {
            this.started = true;
            this.game.render();
        }
        return;
    }

    if (!this.map[keynum]) return;

    if (this.map[keynum] === 'z') {
        return this.game.back();
    }

    this.game.move(this.map[keynum]);
    this.game.render();
};

consoleRender.prototype.init = function (game) {

    console.log('%c芜湖~! 感谢访问俺滴小破站, 既然打开了控制台, 那就试试在这里玩2048吧!%c', 'color:#999;font-family:幼圆;font-size:14px', '');

    const args = [
        '点击一下网页空白处, 确保焦点在网页上, 并敲击 %c回车%c 开始游戏, 你可以使用 %c方向键%c 或者 %cW A S D%c 来控制。'
        , 'color:red;font-weight:bold;', ''
        , 'color:red;font-weight:bold;', ''
        , 'color:red;font-weight:bold;', ''
    ];
    console.log.apply(console, args);

    this.game = game;

    if (typeof $ == 'function') {
        $(window).on("keydown", $.proxy(this.keydownHandler, this));
    } else {
        window.addEventListener = this.keydownHandler.bind(this);
    }

};

(() => {

    if (!console) return;

    const gm2048 = new gmFactory(4);
    const chromerenderer = new consoleRender();
    gm2048.setRenderer(chromerenderer);

    chromerenderer.render(gm2048.tiles, gm2048.actions, true);
})();