interface AudioConfig {
    name: string;
    artist: string;
    src: string;
    lrc: string;
    cover: string;

}

interface PlayerOptions {
    /**
    * @param {string} el 播放器挂载的元素id
    * 
    * 
    * 
    * 
    */
    el: string;
    // 自动播放
    autoplay: boolean;
    // 同一时间只允许一个播放器在播放
    mutex: boolean;
    // 歌词格式
    lrcType: "lrc" | "srt" | "string";
    // 循环模式
    loopType: "list" | "single" | "none";
    // 是否启用随机播放
    shuffle: boolean;
    // 播放器主题
    theme: string;
    // 音量, 1-100的整数
    volume: number;
    // 音频信息
    audio: AudioConfig | AudioConfig[]
}

class LimPlayer {


    constructor(options: PlayerOptions) {
        console.log(options.el);
        
    }
}
