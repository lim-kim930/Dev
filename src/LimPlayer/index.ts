import "./index.css";

interface AudioConfig {
    name: string;
    artist: string;
    src: string;
    lrc?: string;
    lrcType?: "lrc" | "srt" | "string";
    cover?: string;
    theme?: "auto" | string;
}

interface PlayerOptions {
    /**
    * @param {boolean} autoplay 是否自动播放
    * 
    * 
    * 
    * 
    */
    // 自动播放
    autoplay?: boolean;
    // 同一时间只允许一个播放器在播放
    mutex?: boolean;
    // 歌词格式
    lrcType?: "lrc" | "srt" | "string";
    // 循环模式
    loopType?: "list" | "single" | "none";
    // 是否启用随机播放
    shuffle?: boolean;
    // 播放器主题
    theme?: string;
    // 音量, 1-100的整数
    volume?: number;
    // 音频信息
    audio?: AudioConfig[];
    // 存储信息localstorage的字段名

}

class LimPlayer {
    element: HTMLElement;
    options: PlayerOptions;

    constructor(el: string, options?: PlayerOptions) {
        if (!el) throw new Error("Missing required parameter: el");
        const element = document.getElementById(el);
        if (!element) throw new Error("No element found with id: " + el);
        this.element = element;
        this.options = this.initOptions(options);
        element.classList.add("limplayer");
        
    }

    initOptions(options?: PlayerOptions) {
        const defaultOptions: PlayerOptions = {
            autoplay: true,
            mutex: false,
            lrcType: "lrc",
            loopType: "none",
            shuffle: false,
            theme: "default",
            volume: 50,
            audio: []
        };
        return options ? { ...defaultOptions, ...options } : defaultOptions;
    }

    
    
}



export default LimPlayer;