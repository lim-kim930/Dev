import "./index.css";
import template from "./html_template";

interface AudioConfig {
    name: string;
    artist: string;
    src: string;
    lrc?: string;
    lrcType?: "lrc" | "srt" | "string";
    cover?: string;
    theme?: "auto" | string;
    id?: string;
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
    playing: AudioConfig | null;

    constructor(el: string, options?: PlayerOptions) {
        if (!el) throw new Error("Missing required parameter: el");
        const element = document.getElementById(el);
        if (!element) throw new Error("No element found with id: " + el);
        this.element = element;
        this.options = this.initOptions(options);
        element.classList.add("limplayer");
        element.innerHTML = template;
        this.playing = null;
        this.initEvent();
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

    initEvent() {
        const liked = document.querySelector(".limplayer .like .liked") as HTMLElement;
        const unlike = document.querySelector(".limplayer .like .unliked") as HTMLElement;
        const shuffle = document.querySelector(".limplayer .shuffle") as HTMLElement;
        const shufflePointer = document.querySelector(".limplayer .shuffle span") as HTMLElement;
        let oldSvg: HTMLElement;
        let newSvg: HTMLElement;
        let className: string[];
        document.querySelector(".limplayer .like button")?.addEventListener("click", () => {
            if (liked.classList.contains("animate_beat")) {
                oldSvg = liked;
                newSvg = unlike;
                className = ["animate_beat", "animate_shake"];
                this.likeChanged("unlike",this.playing!);
            } else {
                oldSvg = unlike;
                newSvg = liked;
                className = ["animate_shake", "animate_beat"];
                this.likeChanged("liked",this.playing!);
            }
            oldSvg.style.display = "none";
            oldSvg.classList.remove(className[0]);
            newSvg.style.display = "block";
            newSvg.classList.add(className[1]);
        });

        document.querySelector(".limplayer-main-controller .shuffle")?.addEventListener("click", () => {
            shuffle.classList.add("animate_beat");
            if(shuffle.classList.contains("checked")) {
                shuffle.classList.remove("checked");
                shufflePointer.style.display = "none";
            } else {
                shuffle.classList.add("checked");
                shufflePointer.style.display = "block";
            }
            // if ($(".shuffle svg").hasClass("checked")) {
            //     $(".shuffle svg").removeClass("checked");
            //     $(".shuffle span").hide();
            // } else {
            //     $(".shuffle svg").addClass("checked");
            //     $(".shuffle span").show();
            // }
            setTimeout(() => {
                shuffle.classList.remove("animate_beat");
            }, 300);
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    likeChanged(value: "liked" | "unlike", audio: AudioConfig) {}

    onLikeChanged(callback: (value: "liked" | "unlike", audio: AudioConfig)=> void) {
        this.likeChanged = callback;
    }

    // on(event: string, callback: (data: any)=> void) {
    //     switch(event) {
    //         case "like":
    //             this.liked = callback;
    //     }
    // }

}



export default LimPlayer;