/** 
 * Development version 2.0.0
 * If you find a problem with this code or have some suggestions, please contact us by email. E-mail: 1625753207lim@gmail.com.
 */
import $ from "jquery"

enum Moves {
    start,
    up,
    left,
    down,
    right,
    back
}

type Events = "start" | "end" | "move"

// TODO: 增加游戏结束判断
// const gmFactory = function (size: number, maxScores?: number) {

    
//     let tiles: number[], max = moves = 0, winScores = 2048, actions: object[] = [], histories: number[][] = [];
//     let events = { 'start': [] as any[], 'end': [] as any[], 'move': [] as any[] };
//     // let instance;

//     class Instance {
//         moves: number;
//         renderer: consoleRender | undefined;
//         init (initRow: number, maxScores?: number) {
//             // 初始化,游戏棋盘大小,最高分
//             tiles = new Array(initRow * initRow);
//             size = initRow;
//             for (let i = 0; i < tiles.length; i++) {
//                 tiles[i] = 0;
//             }

//             if (maxScores) winScores = maxScores;

//             Object.defineProperty(this, "tiles", {
//                 get: function () {
//                     return tiles;
//                 }
//             });

//             Object.defineProperty(this, "actions", {
//                 get: function () {
//                     return actions;
//                 }
//             });

//             Object.defineProperty(this, "highestScore", {
//                 get: function () {
//                     return max;
//                 }
//             });

//             Object.defineProperty(this, "moves", {
//                 get: function () {
//                     return moves;
//                 }
//             });

//             Object.defineProperty(this, 'maxScores', {
//                 get: function () {
//                     return winScores;
//                 }
//             });

//             for (let i = 0; i < 6; i++) {
//                 this.randomVal();
//             }
//         }; 
//         randomVal () {
//             let emptyTiles = [];
//             for (let i = 0; i < tiles.length; i++) {
//                 if (tiles[i] == 0) emptyTiles.push(i);
//             }

//             if (emptyTiles.length < 1) {
//                 return false;
//             }

//             const pos = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
//             tiles[pos] = Math.random() < 0.8 ? 2 : 4;

//             actions.push({ 'type': 'create', 'index': pos, 'value': tiles[pos] });
//         };
//          move(dir: Moves) {
//             let rowStart: number = 0, rowStep: number = 0, nextStep: number = 0;
//             actions = [];
//             if (dir === Moves.up) {
//                 rowStart = 0;
//                 rowStep = 1;
//                 nextStep = size;
//             } else if (dir === Moves.left) {
//                 rowStart = 0;
//                 rowStep = size;
//                 nextStep = 1;
//             } else if (dir === Moves.down) {
//                 rowStart = tiles.length - 1;
//                 rowStep = -1;
//                 nextStep = -size;
//             } else if (dir === Moves.right) {
//                 rowStart = tiles.length - 1;
//                 rowStep = -size;
//                 nextStep = -1;
//             }
//             moves++;
//             const end = tiles.length - 1 - rowStart;
//             let megnet = rowStart;

//             let his: number[] = [];
//             for (let i = 0; i < tiles.length; i++) {
//                 his[i] = tiles[i];
//             }
//             histories.push(his);

//             let currentRow = 0;
//             while ((end != 0 && megnet < end) || (end == 0 && megnet > 0) && currentRow < size) {

//                 let floatTile = megnet;
//                 while (!this.isAtEdge(dir, megnet)) {

//                     floatTile = floatTile + nextStep;
//                     const floatTileValue = tiles[floatTile];
//                     const megnetTileValue = tiles[megnet];

//                     const swallowed = this.swallowUp(floatTile, megnet);
//                     if (swallowed || (!swallowed && floatTileValue != 0 && megnetTileValue != 0)) {
//                         megnet = megnet + nextStep;
//                         floatTile = megnet;
//                         continue;
//                     }
//                     if (this.isAtEdge(dir, floatTile)) {
//                         megnet = floatTile;
//                         break;
//                     }
//                 }
//                 rowStart += rowStep;
//                 currentRow++;
//                 megnet = rowStart;
//             }
//             this.randomVal();
//         };
//         isAtEdge(dir: Moves, tileIndex: number) {
//             let leftMargin = 0, rightMargin = size - 1;
//             const maxTopRowValue = size - 1, minBottomRowValue = tiles.length - size;
//             switch (dir) {
//                 case Moves.down:
//                     return tileIndex <= maxTopRowValue;
//                 case Moves.up:
//                     return tileIndex >= minBottomRowValue;
//                 case Moves.left:
//                     return tileIndex % size == rightMargin;
//                 case Moves.right:
//                     return tileIndex % size == leftMargin;
//             }
//         };
//         swallowUp(floatTile: number, megnet: number) {
//             const v1 = tiles[floatTile], v2 = tiles[megnet];

//             if (v1 == 0) return false;

//             if (v1 == v2 || v2 == 0) {
//                 const v = v1 + v2;
//                 tiles[megnet] = v;
//                 tiles[floatTile] = 0;

//                 actions.push({
//                     'type': 'move', 'from': { 'index': floatTile, 'value': v1 }, 'to': { 'index': megnet, 'value': v }
//                 });

//                 max = Math.max(max, v);
//                 if (max == winScores) {
//                     this.init(size);
//                     this.fireEvent("end", this);
//                 }

//                 return v2 != 0;
//             }

//             return false;
//         };
//          back () {
//             if (histories.length < 1) return;
//             tiles = histories.pop() as number[];
//             this.render();
//         };
//         setRenderer(renderer: consoleRender) {
//             this.renderer = renderer;
//             renderer.init(this);
//         };
//         render() {
//             if(this.renderer){
//                 this.renderer.render(this.tiles, actions as [{ [key: string]: any; type: string; }]);
//             }
//         };
//          on(eventName: Events, handler: () => void, scope: any) {
//             if (!events[eventName]) return;
//             let handlers = events[eventName];
//             handlers.push({ 'fn': handler, 'scope': scope });
//         }; 
//         un(eventName: Events, handler: () => void, scope: any) {
//             if (!events[eventName]) return;
//             let handlers = events[eventName];
//             if (handlers.length < 1) return;

//             for (let i = 0; i < handlers.length; i++) {
//                 const h = handlers[i];
//                 if (h.fn == handler && h.scope == scope) {
//                     handlers.splice(i, 1);
//                     break;
//                 }
//             }
//         };
//         fireEvent(eventName: Events, ...args: any[]) {
//             const handlers = events[eventName];
//             if (!handlers || handlers.length < 1) return;
//             for (let i = 0; i < handlers.length; i++) {
//                 let h = handlers[i];
//                 if (typeof h.fn == 'function') {
//                     h.fn.apply(h.scope, args);
//                 }
//             }
//         }
//     };

//     const instance = new Instance();

//     instance.init(size)

//     return instance;

// };

// let consoleRender = function () {
// };

class Game2048 {
    size: number
    maxScore: number
    constructor(size: number = 4, maxScore: number = 2048, ifInitNow: boolean = true) {
        this.size = size;
        this.maxScore = maxScore;
        if(ifInitNow) {
            this.init()
        }
    }
    // 游戏初始化
    init() {
        if(this.maxScore % 2048 !== 0) {
            throw new RangeError("The score to achieve victory must be a multiple of 2048.");
        }
    }
}

class ConsoleRender {
    map: {[key: number]: Moves};
    game: null | any;
    started: boolean;
    constructor() {
        // 按键对应的数字
        this.map = {
            //32 = space
            13: Moves.start, // 'enter'
            87: Moves.up, //'w'
            83: Moves.down, //'s'
            65: Moves.left, //'a'
            68: Moves.right, //'d'
            37: Moves.left, //'←'
            38: Moves.up, //'↑'
            39: Moves.right, //'→'
            40: Moves.down, //'↓'
            90: Moves.back
        };
        this.game = null;
        this.started = false;
    }
    colorPalette (keys: string) {
        const colors = ['#eee4da', '#ede0c8', '#f2b179', '#f59563', '#f67c5f', '#f65e3b', '#edcf72', '#edcc61', '#edc850', '#edc53f', '#edc22e'];
        let r: {[key: string]: string} = {};
        const _keys: string[] = keys.split(",");
        const length = _keys.length;
        for (let i = 0; i < length; i++) {
            r[_keys[i]] = 'background-color:' + colors[i] + ';';
        }
        return r;
    };
    // 添加空格调整数字打印位置
    pad (num: number, length: number) {
        let str = (num || ' ') + '';
        while (length > str.length) str = ' ' + str + ' ';
        if (str.length > length) str = str.slice(0, length - str.length);
        return str;
    };
    render (tiles: number[], actions: [{type: string, [key: string]: any}], notClear: boolean = false) {
        if (!notClear) console.clear();
        console.log(' ');
        const size = Math.sqrt(tiles.length); // 开方获取游戏面积大小: 4x4
        const colors = this.colorPalette("2,4,8,16,32,64,128,256,512,1024,2048"); // 为不同数字匹配相应颜色
        const baseStyle = 'text-align:center;width:100px;display:block;background-color:#ccc;padding:4px 7px;line-height:1.4;color:#000;';
        // 遍历游戏初始值
        for (let i = 0; i < size; i += 1) {
            let msg: string[] = [];
            let style: string[] = [];
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
        let msg: string[] = [];
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
    // 对应按键处理
    keydownHandler (e: JQuery.KeyDownEvent) {
        
        let keynum = e.keyCode || e.which;
        
        if(!this.started) {
            if (this.map[keynum] === Moves.start) {
            // this.game.render();
            return this.started = true;
            }
        }



        if (!this.map[keynum]) return;

        if (this.map[keynum] === Moves.start) {
            if(!this.started) {
                // this.game.render();
            }
            return this.started = true;
        }
    
        if (this.map[keynum] === Moves.back) {
            return this.game.back();
        }
    
        this.game.move(this.map[keynum]);
        this.game.render();
    };
    init (game: Game2048) {
        console.log('%c芜湖~! 感谢访问俺滴小破站, 既然打开了控制台, 那就试试在这里玩2048吧!%c', 'color:#999;font-family:幼圆;font-size:14px', '');
        const args = [
            '%c点击一下网页空白处, 确保焦点在网页上, 并敲击%c %c回车%c %c开始游戏, 你可以使用%c %c方向键%c %c或者%c %cW A S D%c %c来控制, 也可以使用%c %cZ%c %c来回退操作.%c'
            , 'color:#999;font-family:幼圆;font-size:14px', ''
            , 'color:red;font-weight:bold;font-family:幼圆;font-size:14px', ''
            , 'color:#999;font-family:幼圆;font-size:14px', ''
            , 'color:red;font-weight:bold;font-family:幼圆;font-size:14px', ''
            , 'color:#999;font-family:幼圆;font-size:14px', ''
            , 'color:red;font-weight:bold;font-family:幼圆;font-size:14px', ''
            , 'color:#999;font-family:幼圆;font-size:14px', ''
            , 'color:red;font-weight:bold;font-family:幼圆;font-size:14px', ''
            , 'color:#999;font-family:幼圆;font-size:14px', ''
        ];
        console.log.apply(console, args);
    
        this.game = game;
        // if (typeof $ == 'function') {
            $(window).on("keydown", this.keydownHandler);
        // } else {
        //     window.addEventListener = this.keydownHandler.bind(this);
        // }
    };
}

// (() => {

//     if (!console) return;

//     const gm2048 = new gmFactory(4);
//     const chromerenderer = new consoleRender();
//     gm2048.setRenderer(chromerenderer);

//     chromerenderer.render(gm2048.tiles, gm2048.actions, true);
// })();

export { Game2048, ConsoleRender }